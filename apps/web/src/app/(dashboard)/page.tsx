"use client"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:3001");

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.emit("sendToGoogleApi", {text: "what is this world about, why do we wait death, while we could go to him ?"})
    socket.on("googleApiResponse",(arg) => console.log(arg))
    socket.on("welcome", (arg) => {
      console.log(arg)
    })
    socket.emit("type", {userSentence: "the birst flow by"})

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);
  return (
    <div className="flex w-screen items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-2xl rounded-xl shadow-lg md:w-[70%] lg:w-[60%] text-gray-50 overflow-y-auto">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-3xl font-bold text-gray-50">
            Welcome to Your Next.js Fullstack Starter!
          </CardTitle>
          <CardDescription className="text-md text-gray-400">
            Jumpstart your development with a robust, scalable, and modern
            fullstack template. This project is engineered for rapid prototyping
            and production-ready deployments, featuring cutting-edge
            technologies and best practices.
          </CardDescription>
          <CardAction onClick={() => router.push("/home")}>
            Home
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-200">
              Key Features:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-gray-300">
              <li>Monorepo Structure</li>
              <li>Type-Safe Development</li>
              <li>Modern UI/UX</li>
              <li>Optimized Data Fetching</li>
              <li>Robust Backend</li>
              <li>Secure Authentication</li>
              <li>Powerful ORM</li>
              <li>Rich Text Editing</li>
              <li>API Documentation</li>
              <li>Fast Builds</li>
              <li>Scalable Architecture</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-200">
              Tools & Technologies Used:
            </h3>
            <ul className="list-inside list-disc space-y-1 text-gray-300">
              <li>
                Frontend: Next.js, React, TypeScript, Shadcn UI, Tailwind CSS,
                React Query
              </li>
              <li>Backend: Hono.js, BetterAuth, Prisma ORM, PostgreSQL</li>
              <li>Monorepo: Turborepo, pnpm</li>
              <li>Documentation: Swagger</li>
              <li>Build/Bundling: Turbopack</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
