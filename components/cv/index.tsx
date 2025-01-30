"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResumePage from "./Resume";
import { CVData } from "../../app/api/extract-cv/schema.zod";

export default function CV() {
  const [file, setFile] = useState<File | null>(null);
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setCVData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process CV");
      }

      const data = await response.json();
      setCVData(data);
    } catch (err) {
      setError("An error occurred while processing the CV");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("cvData", cvData);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CV Data Extractor</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-2">
          <Input type="file" accept=".pdf" onChange={handleFileChange} />
          <Button type="submit" disabled={!file || isLoading}>
            {isLoading ? "Processing..." : "Extract Data"}
          </Button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cvData && <ResumePage cvData={cvData} />}
    </div>
  );
}
