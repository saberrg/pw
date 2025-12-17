import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Badge } from "@/app/_components/ui/badge";
import { PdfWithProgress } from "../page";

interface PdfCardProps {
  pdf: PdfWithProgress;
}

export function PdfCard({ pdf }: PdfCardProps) {
  const hasProgress = pdf.current_page && pdf.current_page > 1;
  const progressPercentage =
    pdf.current_page && pdf.total_pages
      ? Math.round((pdf.current_page / pdf.total_pages) * 100)
      : 0;

  return (
    <Link href={`/library/${pdf.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
            {pdf.thumbnail_url ? (
              <img
                src={pdf.thumbnail_url}
                alt={pdf.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800">
                <svg
                  className="h-16 w-16 text-blue-500 dark:text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            {hasProgress && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-base line-clamp-2 mb-1">
            {pdf.title}
          </CardTitle>
          {pdf.description && (
            <CardDescription className="line-clamp-2 text-sm">
              {pdf.description}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {hasProgress ? (
            <Badge variant="secondary" className="text-xs">
              Page {pdf.current_page} of {pdf.total_pages}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Not started
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
