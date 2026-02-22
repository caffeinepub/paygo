import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type UserRole = {
    #admin;
    #siteEngineer;
    #projectManager;
    #qc;
    #billingEngineer;
    #viewer;
  };

  public type UserProfile = {
    payGoId : Text;
    name : Text;
    email : Text;
    mobile : Text;
    role : UserRole;
    isActive : Bool;
    principal : Principal;
  };

  public type Project = {
    id : Text;
    projectName : Text;
    clientName : Text;
    startDate : Text;
    estimatedBudget : Float;
    contactNumber : Text;
    siteAddress : Text;
    locationLink1 : Text;
    officeAddress : Text;
    locationLink2 : Text;
    note : Text;
    status : Text;
  };

  public type Contractor = {
    id : Text;
    date : Text;
    project : Text;
    contractorName : Text;
    trade : Text;
    unit : Text;
    unitPrice : Float;
    estimatedQty : Float;
    estimatedAmount : Float;
    mobile : Text;
    email : Text;
    address : Text;
    attachments : [Text];
  };

  public type Bill = {
    id : Text;
    billNumber : Text;
    contractor : Text;
    project : Text;
    projectDate : Text;
    trade : Text;
    unit : Text;
    unitPrice : Float;
    quantity : Float;
    total : Float;
    description : Text;
    location : Text;
    authorizedEngineer : Text;
    pmApproved : Bool;
    pmDebit : Float;
    pmNote : Text;
    qcApproved : Bool;
    qcDebit : Float;
    qcNote : Text;
    billingApproved : Bool;
    finalAmount : Float;
    status : Text;
    createdBy : Principal;
  };

  public type NMREntry = {
    date : Text;
    labourType : Text;
    noOfPersons : Float;
    rate : Float;
    hours : Float;
    duty : Text;
    amount : Float;
  };

  public type NMR = {
    id : Text;
    project : Text;
    contractor : Text;
    trade : Text;
    weekStartDate : Text;
    weekEndDate : Text;
    engineerName : Text;
    entries : [NMREntry];
    pmApproved : Bool;
    pmDebit : Float;
    pmNote : Text;
    qcApproved : Bool;
    qcDebit : Float;
    qcNote : Text;
    billingApproved : Bool;
    finalAmount : Float;
    status : Text;
    createdBy : Principal;
  };

  public type Payment = {
    id : Text;
    paymentId : Text;
    billNumber : Text;
    paymentDate : Text;
    project : Text;
    contractor : Text;
    billTotal : Float;
    paidAmount : Float;
    balance : Float;
    status : Text;
    createdBy : Principal;
  };

  type OldActor = {
    users : Map.Map<Principal, UserProfile>;
    usersByEmail : Map.Map<Text, Principal>;
    usersByMobile : Map.Map<Text, Principal>;
    projects : Map.Map<Text, Project>;
    contractors : Map.Map<Text, Contractor>;
    bills : Map.Map<Text, Bill>;
    nmrs : Map.Map<Text, NMR>;
    payments : Map.Map<Text, Payment>;
    billNumberCounters : Map.Map<Text, Nat>;
    paymentCounters : Map.Map<Text, Nat>;
    nextUserId : Nat;
    nextProjectId : Nat;
    nextContractorId : Nat;
    nextBillId : Nat;
    nextNMRId : Nat;
    nextPaymentId : Nat;
    nextPrincipalId : Nat; // Old field to be removed
  };

  type NewActor = {
    users : Map.Map<Principal, UserProfile>;
    usersByEmail : Map.Map<Text, Principal>;
    usersByMobile : Map.Map<Text, Principal>;
    pendingUsers : Map.Map<Text, { name : Text; email : Text; mobile : Text; role : UserRole }>;
    projects : Map.Map<Text, Project>;
    contractors : Map.Map<Text, Contractor>;
    bills : Map.Map<Text, Bill>;
    nmrs : Map.Map<Text, NMR>;
    payments : Map.Map<Text, Payment>;
    billNumberCounters : Map.Map<Text, Nat>;
    paymentCounters : Map.Map<Text, Nat>;
    nextUserId : Nat;
    nextProjectId : Nat;
    nextContractorId : Nat;
    nextBillId : Nat;
    nextNMRId : Nat;
    nextPaymentId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { old with pendingUsers = Map.empty<Text, { name : Text; email : Text; mobile : Text; role : UserRole }>() };
  };
};
