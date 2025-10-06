/**
 * Brand component responsible for displaying the application name
 * Single responsibility: Display brand identity
 */
export function Brand() {
  return (
    <div className="flex items-center">
      <h1 className="text-foreground text-xl font-semibold">VectorVerify</h1>
    </div>
  );
}
