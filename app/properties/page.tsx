import { PropertyList } from "../../src/components/PropertyList";

export default function PropertiesPage() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Properties</h1>
      <PropertyList />
    </main>
  );
}