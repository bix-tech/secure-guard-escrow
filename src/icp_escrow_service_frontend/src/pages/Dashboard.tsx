import { backend } from "../../../declarations/backend";
import { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { usePrincipal } from "../hooks/usePrincipal";


interface ActivityLog {
  dealId: number;
  description: string;
  activityType: string;
  amount: number;
  activityTime: number;
  user: string;
  status: string;
  deal: {
    to: Principal;
  }
}
const itemsPerPage = 10;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const {principal} = usePrincipal();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };


  const fetchActivityLogs = async () => {
    setIsLoading(true);
    if (principal) {
      try {
        const logs = await backend.getActivityLogsForUser(Principal.fromText(principal));
        console.log("Activity logs:", logs);
        const mappedLogs = logs.map(log => ({
          ...log,
          dealId: Number(log.dealId),
          description: log.description.toString(),
          amount: Number(log.amount),
          activityTime: Number(log.activityTime),
          user: log.user.toString(),
          status: log.status.toString(),
        }));
        setActivityLogs(mappedLogs);
        setTotalItems(logs.length);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch activity logs:", error);
      }
    }
  };

  useEffect(() => {
    if (principal) {
      fetchActivityLogs();
    }
  }, [principal, currentPage]);

  const handleConfirmDeal = async (dealId: number) => {
    try {
      const result = await backend.confirmDeal(BigInt(dealId), Principal.fromText(principal || ''));
      console.log("Confirm deal result:", result);
      fetchActivityLogs();
    } catch (error) {
      console.error("Failed to confirm deal:", error);
    }
  }

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
                    <td>
                      {log.status === "Submitted Deliverables" && log.user === log.deal.to.toText() && (
                        <button onClick={() => handleConfirmDeal(log.dealId)}>Confirm Deal</button>
                      )}
                    </td>
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