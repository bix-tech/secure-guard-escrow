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
}
const itemsPerPage = 10;

const Transaction = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { principal } = usePrincipal();
    const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    }

    useEffect(() => {
        const fetchTransactionLogs = async () => {
            setIsLoading(true);
            if (principal) {
                try {

                    const logs = await backend.getTransactionLogsForUser(Principal.fromText(principal));
                    if ('ok' in logs) {
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

                        setTransactionLogs(mappedLogs);

                        const totalLogs = await backend.getTransactionLogsCountForUser(Principal.fromText(principal), BigInt(currentPage), BigInt(itemsPerPage));
                        setTotalItems(totalLogs.length);
                        setIsLoading(false);

                    }
                } catch (error) {
                    console.error("Error fetching transaction logs:", error);
                }
            }
        }

        fetchTransactionLogs();
    }, [principal]);


    return (
        <div className="container-fluid mt-1 d-flex flex-column">
            <div className="row">
                <div className="card p-5 mx-auto my-5" style={{ width: '80%' }}>
                    <h2>Activity Logs</h2>
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