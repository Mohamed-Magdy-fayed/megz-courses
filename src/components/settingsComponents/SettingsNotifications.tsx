import { useCallback, FormEventHandler } from "react";
import { PaperContainer } from "@/components/ui/PaperContainers";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Typography } from "../ui/Typoghraphy";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

export const SettingsNotifications = () => {
  const handleSubmit: FormEventHandler = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <Typography variant={"secondary"} >
            Notifications
          </Typography>
          <Typography variant={"default"} >
            Manage the notifications
          </Typography>
        </CardHeader>
        <Separator />
        <CardContent>
          <div>
            <div>
              <div>
                <Typography variant="secondary">Notifications</Typography>
                <div>
                  <Checkbox />
                  <Checkbox />
                  <Checkbox />
                  <Checkbox />
                </div>
              </div>
            </div>
            <div>
              <div>
                <Typography variant="secondary">Messages</Typography>
                <div>
                  <Checkbox />
                  <Checkbox />
                  <Checkbox />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <div className="flex justify-end p-4">
          <Button className="bg-primary">
            Save
          </Button>
        </div>
      </Card>
    </form>
  );
};
