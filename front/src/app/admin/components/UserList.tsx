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
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                    </tr>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                    </tr>
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                        <td className="px-6 py-4">Test</td>
                    </tr>
                </tbody>
            </table>
            <div className="flex justify-between items-center px-4 py-3">
                <div className="text-sm text-slate-500">
                    Showing <b>1-5</b> of 45
                </div>
                <div className="flex space-x-1">
                    <button className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
                        Prev
                    </button>
                    <button className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-white bg-slate-800 border border-slate-800 rounded hover:bg-slate-600 hover:border-slate-600 transition duration-200 ease">
                        1
                    </button>
                    <button className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
                        2
                    </button>
                    <button className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
                        3
                    </button>
                    <button className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}