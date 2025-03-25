"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";

/**
 * Table displaying all user models
 */
export default function ModelsTable({ models }) {
  function handleRedirect(id) {
    window.location.href = `/overview/models/${id}`;
  }

  function handleViewClick(e, id) {
    e.stopPropagation();
    window.location.href = `/overview/models/${id}`;
  }

  return (
    <div className="rounded-md border">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Samples</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models?.map((model) => (
            <TableRow
              key={model.modelId}
              onClick={() => handleRedirect(model.id)}
              className="cursor-pointer h-16"
            >
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    model.status === "finished" ? "default" : "secondary"
                  }
                >
                  {model.status === "processing" ? "training" : model.status}
                  {model.status === "processing" && (
                    <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
                  )}
                </Badge>
              </TableCell>
              <TableCell>{model.type}</TableCell>
              <TableCell>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {model.samples.slice(0, 3).map((sample) => (
                    <Avatar key={sample.id}>
                      <AvatarImage src={sample.uri} className="object-cover" />
                    </Avatar>
                  ))}
                  {model.samples.length > 3 && (
                    <Badge variant="outline" className="rounded-full h-10">
                      +{model.samples.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {model.status === "finished" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => handleViewClick(e, model.id)}
                  >
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
