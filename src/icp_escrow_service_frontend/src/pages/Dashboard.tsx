import { backend } from "../../../declarations/backend";
import { useState, useEffect } from 'react';
import localforage from "localforage";
import { Principal } from "@dfinity/principal";


interface ActivityLog {
  dealId: number;
  description: string;
  activityType: string;
  amount: number;
  activityTime: number;
  user: string;
  status: string;
}
const itemsPerPage = 10;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadPrincipal = async () => {
      const storedPrincipalText = await localforage.getItem<string>('principal');
      if (storedPrincipalText) {
        setPrincipal(Principal.fromText(storedPrincipalText));
        const itemCount = await backend.getActivityLogsCountForUser(Principal.fromText(storedPrincipalText));
        setTotalItems(Number(itemCount));
      }
    };
    loadPrincipal();
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    async function fetchActivityLogs() {
      setIsLoading(true);
      if (principal) {
        try {
          const logs = await backend.getActivityLogsForUser(principal);
          console.log("Activity logs:", logs);
          const mappedLogs = logs.map(log => ({
            ...log,
            dealId: Number(log.dealId),
            description: log.description.toString(),
            amount: Number(log.amount),
            activityTime: Number(log.activityTime),
            user: log.user.toString(),
            status: Object.keys(log.status)[0]
          }));
          setActivityLogs(mappedLogs);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch activity logs:", error);
        }
      }
    }

    if (principal) {
      fetchActivityLogs();
    }
  }, [principal, currentPage]);


  return (
    <div>
      <div className="d-flex flex-row justify-content-between p-5">
        <div className="card p-5 mx-auto my-5" style={{ width: '80%' }}>
          <h2>Activity Logs</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}> 
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                activityLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.dealId}</td>
                    <td>{log.description}</td>
                    <td>{log.activityType}</td>
                    <td>{log.amount}</td>
                    <td>{log.status}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
          <div className="pagination justify-content-center">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => handlePageClick(i)} className={currentPage === i ? 'active' : ''}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )

}

export default Dashboard