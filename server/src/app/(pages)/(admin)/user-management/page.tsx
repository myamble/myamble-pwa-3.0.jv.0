// src/app/(pages)/(admin)/user-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button onClick={() => handleEditUser(row.original)}>Edit</Button>
      ),
    },
  ];

  const handleEditUser = (user) => {
    // Implement edit user functionality
    console.log("Edit user:", user);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 text-2xl font-bold">User Management</h1>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <DataTable columns={columns} data={filteredUsers} />
    </div>
  );
}
