'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/app/types/project';
import { useRouter } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const APT_PRICE_API = "https://api.binance.com/api/v3/ticker/price?symbol=APTUSDC";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const { connected } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [aptPrice, setAptPrice] = useState<number | null>(null);
  const [aptAmount, setAptAmount] = useState<number>(0); // APT amount for the project

  useEffect(() => {
    // Fetch the APT price from Binance
    const fetchAptPrice = async () => {
      try {
        const response = await fetch(APT_PRICE_API);
        const data = await response.json();
        const price = parseFloat(data.price);
        setAptPrice(price);

        // Calculate APT amount for the project price
        const aptForProjectPrice = project.price / price;
        setAptAmount(aptForProjectPrice);
      } catch (error) {
        console.error("Failed to fetch APT price:", error);
        setAptPrice(null);
      }
    };

    fetchAptPrice();
  }, [project.price]);

  const handleReadMore = () => {
    setExpanded(!expanded);
  };

  const handleBuy = () => {
    router.push(`/checkout?id=${project.ID}`);
  };

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <img
        src={project.image || '/images/placeholder.png'}
        alt={project.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          <div className="flex items-center text-gray-400 mb-2">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <circle
                cx={12}
                cy={12}
                r={3}
                stroke="currentColor"
                strokeWidth={2}
                fill="none"
              />
            </svg>
            <span>{project.location}</span>
          </div>
          <p
            className={`text-gray-300 text-sm mb-4 transition-all duration-300 ${
              expanded ? 'max-h-full' : 'max-h-20 overflow-hidden'
            }`}
          >
            {project.description}
          </p>
          <button
            onClick={handleReadMore}
            className="text-teal-500 text-sm hover:underline mb-4"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
          <div className="flex space-x-2 mb-4">
            <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded">
              {project.type}
            </span>
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
              {project.registry}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          {!connected && (
            <span className="text-red-500 text-sm mb-2">
              Please connect wallet
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-teal-500">
              {aptPrice ? (
                <>
                  {aptAmount.toFixed(4)} APT (${project.price})
                </>
              ) : (
                <>${project.price}</>
              )}
            </span>
            <button
              onClick={handleBuy}
              disabled={!connected}
              className={`px-4 py-2 rounded ${
                connected
                  ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;