import { backend } from "../../../declarations/backend";
import { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { usePrincipal } from "../hooks/usePrincipal";
import Sidebar from '../components/Sidebar';
import Bottombar from '../components/Bottombar';
import { useNavigate } from "react-router";


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

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const { principal } = usePrincipal();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
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
        const totalLogs = await backend.getActivityLogsCountForUser(Principal.fromText(principal), BigInt(currentPage), BigInt(itemsPerPage));
        setTotalItems(totalLogs.length);
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
    <div className="container-fluid mt-1">
      <div className="row">
        <Sidebar />
        <div className="col-md-9 ms-sm-auto col-lg-10 px-1" style={{ position: 'relative' }}>
        <div className="button-container mx-5" style={{float: 'right'}}>
        <button className="btn btn-create btn-primary" onClick={handleCreateDeal}> Create Deal </button>
        </div>
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
            <div className="pagination justify-content-center">
              <button className="previous-page-button" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => handlePageClick(i)} className={`pages-button ${currentPage === i ? 'active' : ''}`}>
                  {i + 1}
                </button>
              ))}
              <button className="next-page-button" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>Next</button>
            </div>
          </div>

          <Bottombar/>
        </div>



      </div>
    </div>
  )

}

export default Dashboard