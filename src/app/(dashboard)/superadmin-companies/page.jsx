"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";
import { companyService } from "@/frontend/services/companyService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

const statuses = ["active", "suspended", "pending_review"];

export default function SuperadminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  const loadCompanies = async () => {
    try {
      const response = await companyService.listAllForSuperadmin();
      setCompanies(response.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, "Failed to load companies"));
    }
  };

  useEffect(() => {
    if (user?.role === "superadmin") {
      loadCompanies();
    }
  }, [user?.role]);

  const changeStatus = async (companyId, status) => {
    try {
      await companyService.updateStatus(companyId, status);
      await loadCompanies();
    } catch (err) {
      setError(extractApiError(err, "Failed to update company status"));
    }
  };

  if (user && user.role !== "superadmin") {
    return <p className="text-sm text-slate-600">Only superadmin can access this page.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Companies" description="Review, activate, suspend, and monitor tenant companies." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.companyName}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === "active" ? "success" : "warning"}>
                      {company.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap gap-2">
            {companies.map((company) =>
              statuses.map((status) => (
                <Button
                  key={`${company.id}-${status}`}
                  size="sm"
                  variant="outline"
                  onClick={() => changeStatus(company.id, status)}
                >
                  {company.companyName}: {status}
                </Button>
              )),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
