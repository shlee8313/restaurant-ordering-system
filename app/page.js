import Link from "next/link";
// import { testMongoConnection } from "../lib/mongodb";

//=======================
// export async function getServerSideProps() {
//   try {
//     await testMongoConnection();
//     return { props: { message: "MongoDB connection is working!" } };
//   } catch (error) {
//     return { props: { message: "MongoDB connection failed", error: error.message } };
//   }
// }
//=========================
export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">Restaurant Order System</h1>
      <Link href="/guest" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Guest Page
      </Link>
      <Link
        href="/admin"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
      >
        Admin Page
      </Link>

      {/* <div>
        <h1>{message}</h1>
      </div> */}
    </div>
  );
}
