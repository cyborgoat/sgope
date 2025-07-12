"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LLMServiceConfig from "@/components/LLMServiceConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Server,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your application preferences and settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* LLM Service Configuration - Full Width */}
        <div className="md:col-span-2">
          <LLMServiceConfig />
        </div>
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              General
            </CardTitle>
            <CardDescription>
              Basic application settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save responses</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save chat responses to knowledge base
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in your browser
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Error notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when errors occur
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Task reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me about due tasks
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme throughout the app
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact layout</Label>
                <p className="text-sm text-muted-foreground">
                  Use more space-efficient layouts
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth animations and transitions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your data privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the app by sharing usage data
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-backup</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup your data locally
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Session timeout (minutes)</Label>
              <Input type="number" placeholder="30" defaultValue="30" />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your local data and storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Storage usage</Label>
              <div className="text-sm text-muted-foreground">
                Knowledge base: ~2.4 MB<br />
                Chat history: ~1.1 MB<br />
                Tasks: ~0.3 MB<br />
                Settings: ~0.1 MB
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backend Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Backend Configuration
            </CardTitle>
            <CardDescription>
              Configure backend server connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backend-url">Backend URL</Label>
              <Input 
                id="backend-url" 
                placeholder="http://localhost:8000" 
                defaultValue="http://localhost:8000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
              <Input 
                id="api-timeout" 
                type="number" 
                placeholder="30" 
                defaultValue="30"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-reconnect</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically reconnect when connection is lost
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full">
              Test Connection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
