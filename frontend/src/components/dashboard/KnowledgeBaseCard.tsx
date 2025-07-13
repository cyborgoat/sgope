"use client";

import { useState, useEffect } from "react";
import { fetchKnowledgeFiles, fetchKnowledgeFileContent } from "@/lib/api/knowledge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Folder, 
  RefreshCw, 
  Eye,
  Database,
  ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


interface FileItem {
  id: string;
  label: string;
  description: string;
  name?: string;
  path?: string;
  type?: 'file' | 'directory' | 'folder' | 'image';
  metadata?: {
    type?: string;
    path?: string;
    size?: number;
  };
}

interface KnowledgeStats {
  total_files: number;
  total_folders: number;
  total_images: number;
  recent_uploads: number;
}

export function KnowledgeBaseCard() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({
    total_files: 0,
    total_folders: 0,
    total_images: 0,
    recent_uploads: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const fetchKnowledgeData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchKnowledgeFiles();
      const filesList = data.files || [];
      setFiles(filesList);
      const stats = filesList.reduce((acc: KnowledgeStats, file: FileItem) => {
        if (file.type === 'file') acc.total_files++;
        else if (file.type === 'folder' || file.type === 'directory') acc.total_folders++;
        else if (file.type === 'image') acc.total_images++;
        return acc;
      }, { total_files: 0, total_folders: 0, total_images: 0, recent_uploads: 0 });
      setStats(stats);
    } catch (error) {
      console.error("Error fetching knowledge data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewFile = async (filePath: string, fileName: string) => {
    setSelectedFile(fileName);
    setIsLoadingContent(true);
    try {
      const data = await fetchKnowledgeFileContent(filePath);
      setFileContent(data.content || 'No content available');
    } catch (error) {
      console.error("Error fetching file content:", error);
      setFileContent('Error loading file content');
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'folder':
      case 'directory':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>
              Manage your uploaded files and knowledge sources
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchKnowledgeData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_files}</div>
            <div className="text-xs text-muted-foreground">Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_folders}</div>
            <div className="text-xs text-muted-foreground">Folders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total_images}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
        </div>

        {/* Recent Files */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Files</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-32">
              {files.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type)}
                    <span className="text-sm truncate">{file.label}</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewFile(file.id, file.label)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{selectedFile}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        {isLoadingContent ? (
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Skeleton key={i} className="h-4 w-full" />
                            ))}
                          </div>
                        ) : (
                          <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                            {fileContent}
                          </pre>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              {files.length === 0 && !isLoading && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No files uploaded yet
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            <ChevronRight className="h-4 w-4 mr-2" />
            Manage Knowledge Base
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
