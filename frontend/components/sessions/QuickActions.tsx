import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown, Share2, Trash2 } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <Button className="w-full" variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button className="w-full" variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Transcript
          </Button>
          <Button className="w-full" variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
