"use client"
import DynamicRenderer from "@/components/magic-ui/dynamic-renderer";

const codeString = `
  ({ data }) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(data.price);

    return (
      <div className="p-4 border rounded shadow">
        <h3 className="text-lg font-bold">{data.name}</h3>
        <p className="text-green-600 text-xl">{formattedPrice}</p>
      </div>
    );
  }
`;

const productData = {
  name: 'Wireless Headphones',
  price: 149.99,
  image: 'https://example.com/image.jpg',
};

export default function Page() {
  return (
    <div className="p-8">
      <DynamicRenderer codeString={codeString} data={productData} />
    </div>
  );
}
