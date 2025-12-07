export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extraboldtext-center">MiniBank</h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>
        {children}
      </div>
    </div>
  );
}
