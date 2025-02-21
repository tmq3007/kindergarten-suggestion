import { UserVO } from "@/redux/services/types";
import { Button } from "antd";


interface UserTableRowProps {
    user: UserVO;
}

const UserTableRow = ({ user }: UserTableRowProps) => {
    return (
        <tbody>
                <tr key={user.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.fullname}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phoneNo}</td>
                    <td className="px-6 py-4">{user.dob}</td>
                    <td className="px-6 py-4">{user.address}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">{user.status}</td>
                    <td className="px-6 py-4"><Button about="Delete"></Button></td>
                </tr>
        </tbody>
    );
}

export default UserTableRow;