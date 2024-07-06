// src/app/(pages)/(admin)/user-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Spinner } from "~/components/ui/spinner";

export default function UserManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    data: users,
    isLoading,
    refetch,
  } = api.userManagement.getAllUsers.useQuery();
  const updateUserRole = api.userManagement.updateUserRole.useMutation();
  const assignSocialWorker =
    api.userManagement.assignSocialWorker.useMutation();
  const removeUser = api.userManagement.removeUser.useMutation();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const handleUpdateRole = async (
    userId: string,
    newRole: "ADMIN" | "SOCIAL_WORKER" | "PARTICIPANT",
  ) => {
    try {
      await updateUserRole.mutateAsync({ userId, newRole });
      refetch();
    } catch (error) {
      setError("Failed to update user role. Please try again.");
    }
  };

  const handleAssignSocialWorker = async (
    participantId: string,
    socialWorkerId: string,
  ) => {
    try {
      await assignSocialWorker.mutateAsync({ participantId, socialWorkerId });
      refetch();
    } catch (error) {
      setError("Failed to assign social worker. Please try again.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      try {
        await removeUser.mutateAsync({ userId });
        refetch();
      } catch (error) {
        setError("Failed to remove user. Please try again.");
      }
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Social Worker</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(newRole) =>
                    handleUpdateRole(
                      user.id,
                      newRole as "ADMIN" | "SOCIAL_WORKER" | "PARTICIPANT",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SOCIAL_WORKER">Social Worker</SelectItem>
                    <SelectItem value="PARTICIPANT">Participant</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {user.role === "PARTICIPANT" && (
                  <Select
                    value={user.adminUserId || ""}
                    onValueChange={(socialWorkerId) =>
                      handleAssignSocialWorker(user.id, socialWorkerId)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign social worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        ?.filter((u) => u.role === "SOCIAL_WORKER")
                        .map((sw) => (
                          <SelectItem key={sw.id} value={sw.id}>
                            {sw.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleRemoveUser(user.id)}
                  variant="destructive"
                >
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
