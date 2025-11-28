"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { createEmployee } from "@/lib/actions/onboarding";
//import { set } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UserRole } from "@/lib/generated/prisma";

const employeeSchema = z.object({
  firstName: z.string().min(1, "prénoms obligatoire").max(55),
  lastName: z.string().min(1, "nom obligatoire").max(55),
  email: z.string().email("email invalide").min(1, "email obligatoire").max(100),
  department: z.string().optional(),
  role: z.enum(["ADMIN", "JOUEUR", "MANAGER"] as const, {
    message: "role est obligatoire",
  }),
  langue: z.string().min(1, "langue obligatoire").max(10),
  country: z.string().optional(),
  phone: z.string().optional(),
});



type EmployeeFormValues = z.infer<typeof employeeSchema>;


interface OnboardingFormProps {
  userEmail: string;
  firstName: string;
  lastName: string;
}



const OnboardingForm = ({
  userEmail,
  firstName,
  lastName,
}: OnboardingFormProps) => {

  const { user, isLoaded } = useUser();
  const [accountType, setAccountType] = useState<"admin" | "employee">(
    "employee"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const employeeForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName,
      lastName,
      email: userEmail,
      department: "",
      role: "JOUEUR",
      langue: "FR",
      country: "",
      phone: "",
    },
  });

  

  const handleEmployeeSubmit = async (data: EmployeeFormValues) => {
    if (!user) {
      return;
    }

    let canRedirect = false;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createEmployee(
        user.id,
        data.role as UserRole,
        {
          phone: data.phone,
          country: data.country,
          langue: data.langue,
        }
      );

      console.log(response);

      if (response?.success) {
        console.log("Employee created successfully");
        canRedirect = true;
      }
    } catch (error: unknown) {
      console.error(`Error creating employee: ${error}`);
      setError(
        error instanceof Error ? error.message : "Failed to complete onboarding"
      );
    } finally {
      setIsSubmitting(false);
    }

    if (canRedirect) {
      console.log("Redirecting to appropriate page");
      toast.success("Onboarding completed successfully.");
      
      // Get the selected language and role from the form
      const selectedLanguage = data.langue.toLowerCase();
      const selectedRole = data.role;
      
      // Create the appropriate URL based on role and language
      let redirectUrl = `/${selectedLanguage}`;
      
      switch (selectedRole) {
        case "ADMIN":
          redirectUrl += "/admin";
          break;
        case "JOUEUR":
          redirectUrl += "/joueur";
          break;
        case "MANAGER":
          redirectUrl += "/manager";
          break;
        default:
          redirectUrl += "/joueur"; // Default fallback
      }
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    }
  };

 
  if (!isLoaded) {
    return <div>Loading...</div>;
  }



  return (
    <Card>
      <CardHeader>
        <CardTitle className="hidden sm:flex text-xl font-bold text-center justify-center">
          Bienvennue sur
        </CardTitle>
        <CardTitle className="sm:flex hidden text-xl font-bold text-center justify-center">
          1000 Questions Bibliques pour Moi
        </CardTitle>
        <CardDescription>
          Completer ce formulaire pour créer votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Type de compte</Label>
            <RadioGroup
              defaultValue="employee"
              value={accountType}
              onValueChange={(value) =>
                setAccountType(value as "admin" | "employee")
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="employee"
                  id="employee"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="employee"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                    accountType === "employee" &&
                    "bg-accent text-accent-foreground"
                  )}
                >
                  <span>JOUEUR</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Separator />
          {accountType === "employee" && (
            <Form {...employeeForm}>
              <form
                onSubmit={employeeForm.handleSubmit(handleEmployeeSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={employeeForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénoms</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employeeForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-gray-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={employeeForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={employeeForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vous êtes:</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Dites nous qui vous êtes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="JOUEUR">Joueur</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="grid grid-cols-2 gap-4">

                  <FormField
                    control={employeeForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Abidjan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={employeeForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays:</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez pays" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CI">Côte d&apos;Ivoire</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="BF">Burkina Faso</SelectItem>
                            <SelectItem value="ML">Mali</SelectItem>
                            <SelectItem value="NE">Niger</SelectItem>
                            <SelectItem value="NG">Nigeria</SelectItem>
                            <SelectItem value="SN">Senegal</SelectItem>
                            <SelectItem value="TG">Togo</SelectItem>
                            <SelectItem value="CM">Cameroun</SelectItem>
                            <SelectItem value="CD">République D. Congo</SelectItem>
                            <SelectItem value="CH">Chine</SelectItem>
                            <SelectItem value="JP">Japon</SelectItem>
                            <SelectItem value="KR">Corée du Sud</SelectItem>
                            <SelectItem value="TW">Taïwan</SelectItem>
                            <SelectItem value="TH">Thaïlande</SelectItem>
                            <SelectItem value="VN">Vietnam</SelectItem>
                            <SelectItem value="ID">Indonésie</SelectItem>
                            <SelectItem value="MY">Malaisie</SelectItem>
                            <SelectItem value="PH">Philippines</SelectItem>
                            <SelectItem value="SG">Singapour</SelectItem>
                            <SelectItem value="HK">Hong Kong</SelectItem>
                            <SelectItem value="MO">Macau</SelectItem>
                            <SelectItem value="US">États-Unis</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="AU">Australie</SelectItem>
                            <SelectItem value="NZ">Nouvelle-Zélande</SelectItem>
                            <SelectItem value="ZA">Afrique du Sud</SelectItem>

                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={employeeForm.control}
                    name="langue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue:</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez langue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FR">Français</SelectItem>
                            <SelectItem value="EN">English</SelectItem>
                            <SelectItem value="ES">Espagnol</SelectItem>
                            <SelectItem value="DE">Allemand</SelectItem>
                            <SelectItem value="PT">Portugais</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={employeeForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Whatsapp"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <Alert variant={"destructive"}>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}>
                  {isSubmitting ? "Processing" : "Enregistrer"}
                </Button>
                
               
              </form>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OnboardingForm