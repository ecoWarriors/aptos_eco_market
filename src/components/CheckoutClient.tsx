// src/components/CheckoutClient.tsx

"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProjects } from "@/utils/fetchProjects";
import { Project } from "@/app/types/project";
import { toast } from "@/components/ui/use-toast";
import { aptosClient } from "@/utils/aptosClient";
import { useWalletClient } from "@thalalabs/surf/hooks";
import { COIN_ABI } from "@/utils/coin_abi";

type CheckoutClientProps = {
  projectId?: string;
};

const APT_PRICE_API = "https://api.binance.com/api/v3/ticker/price?symbol=APTUSDC";

const CheckoutClient: React.FC<CheckoutClientProps> = ({ projectId }) => {
  const router = useRouter();
  const { connected, account } = useWallet();
  const { client } = useWalletClient();

  const queryClient = useQueryClient();

  const [aptPrice, setAptPrice] = useState<number | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(1); // Default to 1 credit
  const [aptAmount, setAptAmount] = useState<number>(0); // APT amount required for the transfer
  const [purchaseSuccessful, setPurchaseSuccessful] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null); // For storing the transaction hash

  // Fetch projects data 
  const { data: projects, isLoading, error } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Find the selected project
  const project = projects?.find((p) => p.ID === projectId);

  // Fetch APT price from Binance
  useEffect(() => {
    const fetchAptPrice = async () => {
      try {
        const response = await fetch(APT_PRICE_API);
        const data = await response.json();
        setAptPrice(parseFloat(data.price));
      } catch (error) {
        console.error("Failed to fetch APT price:", error);
        setAptPrice(null);
      }
    };

    fetchAptPrice();
  }, []);

  // Update APT amount whenever the transfer amount or APT price changes
  useEffect(() => {
    if (aptPrice && project) {
      // Calculate total USD price for the selected number of credits
      const totalUsdPrice = project.price * transferAmount;

      // Calculate how much APT is required for the total USD price
      const aptForCredits = totalUsdPrice / aptPrice;
      setAptAmount(aptForCredits); // Set the APT amount
    }
  }, [transferAmount, aptPrice, project]);

  // Handle the purchase confirmation
  const handleConfirmPurchase = async () => {
    if (!client || !account || !project || !transferAmount) {
      console.error("Missing client, account, project, or transfer amount");
      return;
    }

    try {
      const recipientAddress = project.aptos_wallet;
      if (!recipientAddress) {
        console.error("Recipient address (aptos_wallet) is missing");
        return;
      }

      console.log("Recipient address:", recipientAddress);
      const amountToSend = BigInt(Math.round(aptAmount * Math.pow(10, 8))); // Convert APT amount to base unit

      // Use the client to sign and submit transaction
      const committedTransaction = await client.useABI(COIN_ABI).transfer({
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [recipientAddress as `0x${string}`, amountToSend],
      });

      // Wait for transaction confirmation
      const executedTransaction = await aptosClient().waitForTransaction({
        transactionHash: committedTransaction.hash,
      });

      setTransactionHash(executedTransaction.hash);
      setPurchaseSuccessful(true);

      queryClient.invalidateQueries({
        queryKey: ["apt-balance", account?.address],
      });

      toast({
        title: "Success",
        description: `Transaction succeeded, hash: ${executedTransaction.hash}`,
      });

      // Send transaction details to /api/ccep
      const transactionDetails = {
        projectId: project.ID,
        aptAmount,
        usdAmount: transferAmount * project.price,
        transactionHash: executedTransaction.hash,
        aptPrice,
        walletAddress: account?.address,
        toaddress: recipientAddress,
      };

      console.log("Sending transaction details:", transactionDetails);

      const response = await fetch("/api/ccep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AUTH_TOKEN as string,
        },
        body: JSON.stringify(transactionDetails),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit transaction details. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Transaction details successfully sent to /api/ccep:", result);

      // Remove or comment out the automatic redirection
      // router.push("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      console.error("Error during transaction:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      {isLoading && (
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-teal-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx={12}
              cy={12}
              r={10}
              stroke="currentColor"
              strokeWidth={4}
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        </div>
      )}

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error.message}</span>
        </div>
      )}

      {project && !purchaseSuccessful && (
        <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg">
          <img
            src={project.image || "/images/placeholder.png"}
            alt={project.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">{project.name}</h2>
          <p className="text-gray-400 mb-4">{project.description}</p>

          {aptPrice && (
            <div className="flex justify-between items-center text-gray-400 mb-4">
              <span>
                {transferAmount} credit(s) ≈{" "}
                <span className="text-teal-500">{aptAmount.toFixed(4)} APT</span>
              </span>
              <span className="text-sm">
                (${(transferAmount * project.price).toFixed(2)})
              </span>
            </div>
          )}

          <input
            type="number"
            className="w-full p-2 mb-4 rounded-lg text-black"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
          />

          <button
            onClick={handleConfirmPurchase}
            disabled={!connected || !transferAmount || transferAmount <= 0}
            className={`w-full px-4 py-2 rounded ${
              connected
                ? "bg-teal-500 hover:bg-teal-600 text-white cursor-pointer"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            } transition-colors duration-200`}
          >
            Confirm Purchase
          </button>

          {!connected && (
            <span className="text-red-500 text-sm mt-2 block text-center">
              Please connect your wallet to buy
            </span>
          )}

          <div className="text-gray-400 text-sm mt-6 text-center">
            <em>Note: Any amount below $2 worth of APT will be pooled.</em>
          </div>
        </div>
      )}

      {purchaseSuccessful && transactionHash && (
        <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-4 text-teal-500">Purchase Successful!</h2>
          <p className="text-gray-400 mb-4">
            Your transaction has been successfully processed. You will receive your Impact NFT shortly.
          </p>
          <p className="text-gray-400 mb-4">
            You can track your NFT's progress at{" "}
            <a
              href="https://scan.ecotoken.earth"
              className="text-teal-500 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              scan.ecotoken.earth
            </a>{" "}
            by entering the transaction hash.
          </p>
          <p className="text-gray-400 mb-4">Transaction Hash:</p>
          <p className="text-gray-500 font-mono break-all">{transactionHash}</p>

          {/* New Button to Navigate to Homepage */}
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200"
          >
            Go to Homepage
          </button>
        </div>
      )}

      {!isLoading && !error && !project && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> Project not found.</span>
        </div>
      )}
    </div>
  );
};

export default CheckoutClient;