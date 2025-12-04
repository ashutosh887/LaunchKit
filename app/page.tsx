import config from "@/config";

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{config.projectName}</h1>
        <p className="text-lg text-gray-500">{config.projectDescription}</p>
      </div>
    </main>
  );
}
