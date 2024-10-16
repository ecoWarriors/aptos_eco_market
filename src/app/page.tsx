"use client";

import { Header } from "@/components/Header";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/utils/fetchProjects";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/app/types/project";

import React from "react";

function App() {
  const { connected } = useWallet();
  const { data, isLoading, error } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    refetchOnWindowFocus: true, // Refetch when window refocuses
  });

  // Sort the projects by price (USD) from least to greatest
  const sortedProjects = data?.sort((a, b) => a.price - b.price);

  return (
    <>
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <Card>
            <CardContent className="flex flex-col gap-10 pt-6">
              Wallet Connected! You can have positive ecological impact by retiring credits.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>To get started, Connect a wallet</CardTitle>
            </CardHeader>
          </Card>
        )}

        <div className="container mx-auto px-4 py-8">
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

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProjects &&
              sortedProjects.map((project: Project) => (
                <ProjectCard key={project.ID} project={project} />
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;