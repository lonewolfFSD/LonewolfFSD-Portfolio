import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useNavigate } from "react-router-dom";
import { Copy, Wallet, Wallet2, X } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import Logo from './mockups/logo.png';

interface Purchase {
  id: string;
  type: "credits" | "video" | "effect";
  name: string;
  amount: number;
  paymentType: "credits" | "real_money";
  transactionId: string;
  image?: string;
  date: string;
  url?: string;
  paymentMethod?: string;
  contact?: string;
  status?: string;
}

const PurchaseHistory: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const isRefundAvailable = (purchaseDate: string) => {
    try {
      const purchaseDateTime = parseDate(purchaseDate);
      if (!isValid(purchaseDateTime)) return false;
      const now = new Date();
      const diffInMs = now.getTime() - purchaseDateTime.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    } catch (error) {
      console.error("Error checking refund availability:", error);
      return false;
    }
  };

  const parseDate = (dateStr: string): Date => {
    try {
      const formats = [
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd",
        "MM/dd/yyyy HH:mm:ss",
        "MM/dd/yyyy",
        "iso"
      ];
      
      if (typeof dateStr === "object" && "toDate" in dateStr) {
        return dateStr.toDate();
      }

      for (const formatStr of formats) {
        if (formatStr === "iso") {
          const parsed = new Date(dateStr);
          if (isValid(parsed)) return parsed;
        } else {
          const parsed = parse(dateStr, formatStr, new Date());
          if (isValid(parsed)) return parsed;
        }
      }

      const fallback = new Date(dateStr);
      if (isValid(fallback)) return fallback;

      throw new Error("Invalid date format");
    } catch (error) {
      console.error(`Failed to parse date: ${dateStr}`, error);
      return new Date();
    }
  };

  const generateInvoice = (purchase: Purchase) => {
    let formattedDate = "Invalid Date";
    try {
      const parsedDate = parseDate(purchase.date);
      if (isValid(parsedDate)) {
        formattedDate = format(parsedDate, "MMMM d, yyyy");
      }
    } catch (error) {
      console.error("Error formatting date for invoice:", error);
    }

    const invoiceContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 40px;
              background-color: #f9f9f9;
              color: #333;
            }

            @media print {
              .button-container {
                display: none !important;
              }
            }

            .invoice-container {
              background: #fff;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }

            .header {
              text-align: center;
              margin-bottom: 40px;
            }

            .logo {
              max-width: 100px;
              margin-bottom: 10px;
            }

            h1 {
              margin-bottom: 4px;
              font-size: 28px;
            }

            h2 {
              margin-top: 20px;
              font-size: 22px;
              border-bottom: 2px solid #eee;
              padding-bottom: 8px;
              color: #444;
            }

            .info {
              margin-top: 20px;
              line-height: 1.6;
            }

            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }

            .table th,
            .table td {
              border: 1px solid #ddd;
              padding: 12px 14px;
              text-align: left;
            }

            .table th {
              background-color: #f1f1f1;
              color: #555;
            }

            .footer {
              margin-top: 40px;
              font-size: 13px;
              color: #777;
              line-height: 1.6;
            }

            .button-container {
              text-align: left;
              margin-top: 30px;
            }

            .button {
              padding: 10px 20px;
              margin: 0 10px;
              background-color: #333;
              color: #fff;
              border: none;
              border-radius: 5px;
              font-size: 14px;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }

            .button:hover {
              background-color: #555;
            }

            a {
              color: black;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header" style="text-align: left;">
              <img src="https://pbs.twimg.com/profile_images/1905319445851246592/KKJ22pIP_400x400.jpg" class="logo" alt="Company Logo" />
              <h1><strong>LonewolfFSD</strong></h1>
              <p >email: <a style="color: black;" href="mailto:support@lonewolffsd.in">support@lonewolffsd.in</a></p>
              <p style="font-weight: 500;" id="today-date"></p>
            </div>

            <h2>Invoice</h2>

            <div class="info">
              <p><strong>Invoice Number:</strong> ${purchase.id}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Customer:</strong> ${user?.email || "N/A"}</p>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${purchase.name}</td>
                  <td>${purchase.paymentType === "credits" ? `${purchase.amount} Credits` : `₹${purchase.amount}`}</td>
                  <td>${purchase.paymentType === "real_money" ? capitalize(purchase.paymentMethod) : "FSD Credits"}</td>
                  <td>${purchase.transactionId}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p><strong>Terms & Conditions:</strong></p>
              <p>All sales are final after 7 days from the purchase date.</p>
              <p>Refunds are processed as per our refund policy. For assistance, contact our support at <a href="mailto:support@lonewolffsd.in">support@lonewolffsd.in</a>.</p>
            </div>
          </div>

          <div class="button-container">
            <button class="button" onclick="window.print()">Print Invoice</button>
            <button class="button" onclick="download()">Download Invoice - PDF</button>
            <button class="button" onclick="shareInvoice()">Share Invoice</button>
          </div>

          <script>
            function download() {
              const element = document.querySelector('.invoice-container');
              const opt = {
                margin: 1,
                filename: 'Invoice_${purchase.id}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
              };
              html2pdf().from(element).set(opt).save();
            }
          </script>
          
          <script>
            const today = new Date();
            const options = { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            };
            document.getElementById("today-date").innerText = today.toLocaleString(undefined, options);
          </script>
          <script>
            async function shareInvoice() {
              const element = document.querySelector('.invoice-container');
              try {
                const canvas = await html2canvas(element);
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'invoice.png', { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  await navigator.share({
                    title: 'LonewolfFSD Invoice',
                    text: 'Here is your invoice from LonewolfFSD.',
                    files: [file],
                  });
                } else {
                  alert('Sharing is not supported on this device/browser.');
                }
              } catch (error) {
                console.error("Error sharing invoice:", error);
                alert('Failed to share invoice.');
              }
            }
          </script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        </body>
      </html>
    `;
    return invoiceContent;
  };

  const handleInvoiceClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
  };

  const calculateTotalSpent = () => {
    return purchases
      .filter(purchase => purchase.paymentType === "real_money")
      .reduce((total, purchase) => total + purchase.amount, 0);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <ScaleLoader color="#000000" />
      </div>
    );
  }

  const capitalize = (str: string | undefined) => {
    if (!str) return "-";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-12 border border-black h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2
              style={{ fontFamily: "Poppins" }}
              className="text-3xl sm:text-4xl font-bold mt-6 md:mt-auto text-left flex gap-3"
            >
              <Wallet2 size={35} className="mt-0.5 hidden md:block" /> Purchase History
            </h2>
            <p className="text-left text-gray-600 mt-6 py-3 px-4 border-2  font-bold border-black text-sm mt-4 border rounded-md md:hidden">
              Total Spent: ₹{calculateTotalSpent().toFixed(2)}
          </p>
          </div>
          <p className="text-left text-gray-600 border-2 font-bold py-2 px-4 border-black text-sm mt-4 border rounded-lg hidden md:block">
              Total Spent: ₹{calculateTotalSpent().toFixed(2)}
          </p>
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
                <tr className="bg-gray-100 whitespace-nowrap">
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Item Name</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Amount Paid</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Date & Time</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Transaction ID</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Payment Method</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Mobile Number</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Status</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Action</th>
                  <th className="py-4 px-6 border-b border-r border-black text-left font-semibold text-sm">Invoice</th>
                  <th className="py-4 px-20 border-b border-r border-black text-left font-semibold text-sm">Preview</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-black whitespace-nowrap">
                    <td className="py-4 px-6 text-sm border-r border-black font-bold">{purchase.name}</td>
                    <td className="py-4 px-6 text-sm border-r border-black font-bold">
                      {purchase.paymentType === "credits"
                        ? `${purchase.amount} Credits`
                        : `₹${purchase.amount}`}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black">{purchase.date}</td>
                    <td className="py-4 px-6 text-sm border-r border-black font-bold">
                      {purchase.transactionId}
                      {copiedId === purchase.id ? (
                        <span className="ml-2 text-black font-bold text-sm">✔</span>
                      ) : (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(purchase.transactionId);
                            setCopiedId(purchase.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="ml-2 -mb-1 text-black hover:text-gray-800 "
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black ">
                      {purchase.paymentType === "real_money"
                        ? capitalize(purchase.paymentMethod)
                        : "FSD Credits"}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black">
                      {purchase.paymentType === "real_money"
                        ? purchase.contact || "-"
                        : "-"}
                    </td>
                    <td className={`py-4 px-6 text-sm border-r border-black font-bold ${purchase.status === "success" ? 'text-green-600' : 'text-red-500'}`}>
                      {purchase.paymentType === "real_money"
                        ? capitalize(purchase.status)
                        : purchase.paymentType === "credits" && purchase.status === "success"
                        ? "Success"
                        : "Failed"}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black">
                      {purchase.paymentType === "real_money" && purchase.status === "success" && isRefundAvailable(purchase.date) ? (
                        <a
                          href="https://forms.gle/your-google-form-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white bg-black px-4 py-2.5 rounded-md text-sm"
                        >
                          Request Refund
                        </a>
                      ) : purchase.paymentType === "real_money" && purchase.status === "success" ? (
                        <span className="text-red-600 text-sm">Expired</span>
                      ) : (
                        "Not Applicable"
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm border-r border-black">
                      <button
                        onClick={() => handleInvoiceClick(purchase)}
                        className="text-white bg-black px-4 py-2.5 rounded-md text-sm"
                      >
                        Download Invoice
                      </button>
                    </td>
                    <td className="py-4 px-3 text-sm border-r border-black">
                      {["video", "effect"].includes(purchase.type) && purchase.url ? (
                        <video
                          src={purchase.url}
                          className="w-full h-24 object-cover rounded-md pointer-events-none"
                          muted
                          loop
                          autoPlay
                        />
                      ) : purchase.type === "credits" && purchase.image ? (
                        <img
                          src={purchase.image}
                          alt={purchase.name}
                          className="w-full h-24 object-contain rounded-lg pointer-events-none"
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

      {isModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold py-3">Purchase Invoice</h3>
              <button onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            <iframe
              srcDoc={generateInvoice(selectedPurchase)}
              className="w-full h-[70vh]"
              title="Invoice Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;