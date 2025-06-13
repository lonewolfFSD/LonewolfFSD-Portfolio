import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase"; // Adjust import path to your Firebase config
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface Purchase {
  id: string;
  type: "credits" | "video";
  name: string;
  amount: number;
  paymentType: "credits" | "real_money";
  transactionId: string;
  image?: string;
  date: string;
  url?: string;
}

const PurchaseHistory: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      try {
        const purchasesQuery = query(
          collection(db, `users/${user.uid}/purchases`),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(purchasesQuery);
        const purchaseList: Purchase[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Purchase));
        setPurchases(purchaseList);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchases();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <ScaleLoader color="#000000" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-12 border border-black rounded-xl">
        <div className="flex justify-between items-center mb-8">
          <h2
            style={{ fontFamily: "Poppins" }}
            className="text-3xl sm:text-4xl font-bold text-left"
          >
            Purchase History
          </h2>

        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <ScaleLoader color="#000000" />
          </div>
        ) : purchases.length === 0 ? (
          <p className="text-left text-gray-600">No purchases found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Item Name</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Amount Paid</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Date & Time</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Transaction ID</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Preview</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-black">
                    <td className="py-4 px-6 text-sm border-r border-black">{purchase.name}</td>
                    <td className="py-4 px-6 text-sm border-r border-black">
                      {purchase.paymentType === "credits"
                        ? `${purchase.amount} Credits`
                        : `₹${purchase.amount}`}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black">{purchase.date}</td>
                    <td className="py-4 px-6 text-sm border-r border-black">{purchase.transactionId}</td>
                    <td className="py-4 px-6 text-sm">
                      {purchase.type === "video" && purchase.url ? (
                        <video
                          src={purchase.url}
                          className="w-16 h-16 object-cover rounded-lg"
                          muted
                          loop
                          autoPlay
                        />
                      ) : purchase.type === "credits" && purchase.image ? (
                        <img
                          src={purchase.image}
                          alt={purchase.name}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;