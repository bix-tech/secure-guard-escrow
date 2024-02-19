import React, { useEffect, useState } from "react";
import { backend } from "../../../declarations/backend";
import { usePrincipal } from "../hooks/usePrincipal"
import { Principal } from "@dfinity/principal";

type Notification = {
    dealId: BigInt;
    message: string;
}

type SidebarProps = {
    isSidebarActive: boolean;
}
const Notifications: React.FC<SidebarProps> = ({ isSidebarActive }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { principal } = usePrincipal();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (principal) {
                    const result = await backend.getNotification(Principal.fromText(principal || ''));
                    setNotifications(result);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }
        fetchNotifications();
    }, [principal]);

    return (
        <div className="container-fluid p-5">
            <div className="row d-flex">
                <div className={`col-9 card ${isSidebarActive ? 'not-full-width' : 'full-width'}`}>
                    {notifications.map((notification, index) => (
                        <div className="card-body" key={index}>
                            <h5 className="card-title">{notification.dealId.toString()}</h5>
                            <p className="card-text">{notification.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Notifications