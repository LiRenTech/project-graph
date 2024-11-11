import { Outlet } from "react-router-dom";

export default function WelcomeLayout() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-950 to-green-950 overflow-auto">
      <main className="flex h-4/5 lg:w-1/3 md:w-96 w-full flex-col justify-center">
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
