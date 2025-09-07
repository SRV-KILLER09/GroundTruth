
"use client";

import React, { useState } from 'react';
import Header from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Shield, Phone, Search } from "lucide-react";

const emergencyContacts = [
  { service: "National Emergency Number", number: "112" },
  { service: "Police", number: "100" },
  { service: "Fire", number: "101" },
  { service: "Ambulance", number: "102" },
  { service: "Disaster Management (NDMA)", number: "108" },
  { service: "Women Helpline", number: "1091" },
  { service: "Child Helpline", number: "1098" },
  { service: "Air Ambulance", number: "9540161344" },
  { service: "NDRF Helpline", number: "011-26107953, 09711077372" },
  { service: "Central Relief Commissioner (Control Room)", number: "011-23093054" },
  { service: "Flood/Cyclone Helpline (NDMA)", number: "1078" },
  { service: "Earthquake/Tsunami Helpline", number: "1077" },
  { service: "Railway Enquiry", number: "139" },
  { service: "Senior Citizen Helpline", number: "14567" },
  { service: "Tourist Helpline", number: "1363" },
];

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = emergencyContacts.filter(contact =>
    contact.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-6 w-6 text-primary" />
                Emergency Services Directory
              </CardTitle>
              <CardDescription>
                A comprehensive list of verified nationwide emergency helpline numbers for India.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for a service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full max-w-sm"
                />
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Service / Agency
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Helpline Number
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{contact.service}</TableCell>
                        <TableCell className="font-bold text-lg text-primary">{contact.number}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredContacts.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        <p>No matching services found.</p>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
