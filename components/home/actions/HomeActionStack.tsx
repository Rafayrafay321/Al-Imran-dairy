import { WeeklyBillsCard } from "./WeeklyBillsCard";
import { AllBillsCard } from "./AllBillsCard";
import { CustomersCard } from "./CustomersCard";
import { ReportsCard } from "./ReportsCard";
import { MyEntriesCard } from "./MyEntriesCard";

interface HomeActionStackProps {
  isOwner: boolean;
  onWeeklyBills?: () => void;
  onAllBills?: () => void;
  onCustomers?: () => void;
  onReports?: () => void;
  onMyEntries?: () => void;
}

export function HomeActionStack(props: HomeActionStackProps) {
  return (
    <nav aria-label={`${props.isOwner ? "Owner" : "Staff"} navigation`} className="w-full space-y-3">
      <WeeklyBillsCard isVisible onClick={props.onWeeklyBills} />
      <AllBillsCard onClick={props.onAllBills} />
      <CustomersCard onClick={props.onCustomers} />
      {props.isOwner ? <ReportsCard isVisible onClick={props.onReports} /> : <MyEntriesCard onClick={props.onMyEntries} />}
    </nav>
  );
}
