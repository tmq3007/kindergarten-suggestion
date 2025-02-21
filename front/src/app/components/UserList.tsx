import { Pagination } from "antd";
import UserTableRow from "./UserTableRow";

export default function UserList() {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-500">
                    <tr>
                        <th scope="col" className="px-6 py-3">Fullname</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Phone No.</th>
                        <th scope="col" className="px-6 py-3">DOB</th>
                        <th scope="col" className="px-6 py-3">Address</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        
                    }
                </tbody>
            </table>
            <div className="flex justify-between items-center px-4 py-3">
                <Pagination defaultCurrent={1} total={500} size="default"/>
            </div>
        </div>
    );
}