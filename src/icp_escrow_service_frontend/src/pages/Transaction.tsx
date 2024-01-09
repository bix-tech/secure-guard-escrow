import { useEffect, useState } from 'react'
import { backend } from '../../../declarations/backend'
import { usePrincipal } from '../hooks/usePrincipal'
import { Principal } from '@dfinity/principal'

interface TransactionLog {
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

const Transaction = () => {
    const { principal } = usePrincipal();
    const [transactionLogs, setTransactionLogs] = useState<TransactionLog[] | null>(null);
    const [ currentPage, setCurrentPage ] = useState(0);
    const [ totalItems, setTotalItems ] = useState(0);

    useEffect(() => {
        const fetchTransactionLogs = async () => {
            if (principal) {
                try {
                    const logs = await backend.getTransactionLogsForUser(Principal.fromText(principal));
                    if ('ok' in logs) {
                        const mappedLogs = logs.map(log => ({
                            ...log,
                            dealId: Number(log.dealId),
                            description: log.description.toString(),
                            amount: Number(log.amount),
                            activityTime: Number(log.activityTime),
                            user: log.user.toString(),
                            status: log.status.toString(),
                        }));

                        setTransactionLogs(mappedLogs);

                        const totalLogs = await backend.getTransactionLogsCountForUser(Principal.fromText(principal), BigInt(currentPage), BigInt(itemsPerPage));
                    }
                } catch (error) {
                    console.error("Error fetching transaction logs:", error);
                }
            }
        }

        fetchTransactionLogs();
    }, [principal]);

    return (
        <div>Transaction</div>
    )
}

export default Transaction