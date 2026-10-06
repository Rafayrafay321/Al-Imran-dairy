import { WeeklyBillsCard } from "./WeeklyBillsCard";
import { AllBillsCard } from "./AllBillsCard";
import { CustomersCard } from "./CustomersCard";
import { ReportsCard } from "./ReportsCard";
import { MyEntriesCard } from "./MyEntriesCard";

interface HomeActionStackProps { isOwner: boolean; }

export function HomeActionStack(props: HomeActionStackProps) {
  return (
    <nav aria-label={`${props.isOwner ? "Owner" : "Staff"} navigation`} className="w-full space-y-3">
      <WeeklyBillsCard isVisible />
      <AllBillsCard />
      <CustomersCard />
      {props.isOwner ? <ReportsCard isVisible /> : <MyEntriesCard />}
    </nav>
  );
}
