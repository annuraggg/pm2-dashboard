import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="text-9xl font-black text-blue-200">404</div>
    <h1 className="text-3xl font-bold mt-4 text-gray-700">Page Not Found</h1>
    <p className="mt-2 text-gray-500">
      Sorry, the page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Go to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
