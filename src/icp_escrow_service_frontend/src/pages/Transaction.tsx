import { useEffect, useState } from 'react'
import { backend } from '../../../declarations/backend'
import { usePrincipal } from '../hooks/usePrincipal'
import { Principal } from '@dfinity/principal'

interface TransactionLog {
    dealId: number;
    dealName: string;
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
};

interface SidebarProps {
    isSidebarActive: boolean;
};

const itemsPerPage = 10;

const Transaction : React.FC<SidebarProps> = ({ isSidebarActive }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { principal } = usePrincipal();
    const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    }

    useEffect(() => {
        const fetchTransactionLogs = async () => {
            if (principal) {
                try {
                    setIsLoading(true);
                    const logs = await backend.getTransactionLogsForUser(Principal.fromText(principal), BigInt(currentPage), BigInt(itemsPerPage));
                    const mappedLogs = logs.map(log => ({
                        ...log,
                        dealId: Number(log.dealId),
                        dealName: log.dealName.toString(),
                        description: log.description.toString(),
                        amount: Number(log.amount),
                        activityTime: Number(log.activityTime),
                        user: log.user.toString(),
                        status: log.status.toString(),
                    }));
                    console.log(logs);
                    setTransactionLogs(mappedLogs);
                    console.log(mappedLogs);
                    const totalLogsCount = Number(await backend.getTransactionLogsCountForUser(Principal.fromText(principal)));
                    setTotalItems(totalLogsCount);
                    const totalPages = Math.ceil(totalLogsCount / itemsPerPage);
                    setTotalPages(totalPages);

                } catch (error) {
                    console.error("Error fetching transaction logs:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        }

        fetchTransactionLogs();
    }, [principal]);


    return (
        <div className="container-fluid d-flex flex-column p-5">
            <div className="row">
                <div className={`card transaction-card margin-5 p-5 mobile-font-size-8px ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                    <h2>Transaction Logs</h2>
                    <div>Total logs: {totalItems}</div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                                            <div className="spinner-grow text-success" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactionLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                        No transaction found.
                                    </td>
                                </tr>
                            ) : (
                                transactionLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{log.dealId}</td>
                                        <td>{log.dealName}</td>
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

            </div>



        </div>
    )

}


export default Transaction