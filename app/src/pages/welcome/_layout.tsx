import { Outlet } from "react-router-dom";

export default function WelcomeLayout() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-auto">
      <main className="flex h-4/5 w-full flex-col justify-center md:w-96 lg:w-1/3">
        <div className="mb-8">
          <span className="text-2xl text-gray-500">Welcome to</span>
          <h1 className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-5xl font-bold leading-tight text-transparent">
            Project Graph
          </h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
