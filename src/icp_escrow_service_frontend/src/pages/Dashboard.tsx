import { backend } from "../../../declarations/backend";
import { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { usePrincipal } from "../hooks/usePrincipal";
import { useNavigate } from "react-router";

interface DashboardProps {
  isSidebarActive: boolean;
}
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
    from: Principal;
  }
}
const itemsPerPage = 10;

const Dashboard: React.FC<DashboardProps> = ({ isSidebarActive }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const { principal } = usePrincipal();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();



  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateDeal = () => {
    navigate('/createDealStep1')
  };

  const fetchActivityLogs = async () => {
    setIsLoading(true);
    if (principal) {
      try {
        const logs = await backend.getActivityLogsForUser(Principal.fromText(principal), BigInt(currentPage), BigInt(itemsPerPage));
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
        const totalLogsCount = Number(await backend.getActivityLogsCountForUser(Principal.fromText(principal)));
        setTotalItems(totalLogsCount);
        const totalPages = Math.ceil(totalLogsCount / itemsPerPage);
        setTotalPages(totalPages);
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


  return (
    <div className="container-fluid d-flex flex-column p-3">
      <div className="row d-flex">
        <div className={`col-md-9 ms-sm-auto col-lg-12 px-5 d-flex flex-column`} style={{ position: 'relative', minHeight: '100vh' }}>
          <button className="btn btn-create btn-primary my-auto" onClick={handleCreateDeal} style={{ position: 'absolute' }}> Create Deal </button>
          <div className={`card dashboard-card p-5 margin-5 mobile-card d-flex align-items-center ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
            <h2>Activity Logs</h2>
            <div>Total logs: {totalItems}</div>
            <table className="table mobile-font-size-8px">
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
                      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                        <div className="spinner-grow text-success" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                      No activity logs found.
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
            <div className="pagination justify-content-center mobile-font-size-8px">
              <button className="previous-page-button" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => handlePageClick(i)} className={`pages-button ${currentPage === i ? 'active' : ''}`}>
                  {i + 1}
                </button>
              ))}
              <button className="next-page-button" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>Next</button>
            </div>


          </div>

        </div>



      </div>
    </div>
  )

}

export default Dashboard