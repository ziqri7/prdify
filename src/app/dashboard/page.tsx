"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  PlusCircle,
  Clock,
  ExternalLink,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockPRDs = [
  {
    id: "1",
    title: "PRD: TokoOnline.id",
    date: "7 September 2026",
    package: "Pro",
    status: "Selesai",
  },
  {
    id: "2",
    title: "PRD: Aplikasi BelajarKu",
    date: "5 September 2026",
    package: "Basic",
    status: "Selesai",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Kelola riwayat PRD yang sudah kamu buat
            </p>
          </div>
          <Link href="/questionnaire">
            <Button className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Buat PRD Baru
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total PRD", value: "2", icon: FileText },
            { label: "Paket Basic", value: "1", icon: FileText },
            { label: "Paket Pro", value: "1", icon: FileText },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PRD List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat PRD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mockPRDs.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {mockPRDs.map((prd) => (
                  <div
                    key={prd.id}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{prd.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {prd.date}
                          </span>
                          <Badge
                            variant={
                              prd.package === "Pro" ? "default" : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {prd.package}
                          </Badge>
                          <Badge
                            variant="success"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {prd.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/preview/${prd.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada PRD yang dibuat
                </p>
                <Link href="/questionnaire">
                  <Button className="mt-4 gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Buat PRD Pertama
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
