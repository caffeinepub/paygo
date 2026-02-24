import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Array "mo:core/Array";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

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
    createdAt : Nat;
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

  let users = Map.empty<Principal, UserProfile>();
  let usersByEmail = Map.empty<Text, Principal>();
  let usersByMobile = Map.empty<Text, Principal>();
  let pendingUsers = Map.empty<Text, { name : Text; email : Text; mobile : Text; role : UserRole }>();
  let projects = Map.empty<Text, Project>();
  let contractors = Map.empty<Text, Contractor>();
  let bills = Map.empty<Text, Bill>();
  let nmrs = Map.empty<Text, NMR>();
  let payments = Map.empty<Text, Payment>();
  let billNumberCounters = Map.empty<Text, Nat>();
  let paymentCounters = Map.empty<Text, Nat>();

  var nextUserId = 1;
  var nextProjectId = 1;
  var nextContractorId = 1;
  var nextBillId = 1;
  var nextNMRId = 1;
  var nextPaymentId = 1;

  let MAIN_ADMIN_EMAIL = "jogaraoseri.er@mktconstructions.com";
  let DELETE_PASSWORD = "3554";

  func repeat(text : Text, n : Nat) : Text {
    var result = "";
    var i = 0;
    while (i < n) {
      result #= text;
      i += 1;
    };
    result;
  };

  func padZeros(number : Nat, totalLength : Nat) : Text {
    let raw = number.toText();
    let numZeros = if (raw.size() >= totalLength) {
      0;
    } else {
      totalLength - raw.size();
    };
    let zeros = repeat("0", numZeros);
    zeros # raw;
  };

  func generatePayGoUserId() : Text {
    let id = "PG-USR-" # padZeros(nextUserId, 6);
    nextUserId += 1;
    id;
  };

  func isMainAdmin(email : Text) : Bool {
    email == MAIN_ADMIN_EMAIL;
  };

  func hasAnyUsers() : Bool {
    users.size() > 0;
  };

  func checkUserExists(caller : Principal) {
    switch (users.get(caller)) {
      case null {
        Runtime.trap("User not found. Please complete profile setup first.");
      };
      case (?_) {};
    };
  };

  func checkUserActive(caller : Principal) {
    switch (users.get(caller)) {
      case (?user) {
        if (not user.isActive) {
          Runtime.trap("This account is not active.");
        };
      };
      case null {
        Runtime.trap("User not found. Please complete profile setup first.");
      };
    };
  };

  func checkAdminRole(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    checkUserActive(caller);
  };

  func checkCanRaiseBill(caller : Principal) {
    checkUserActive(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (#siteEngineer) {};
          case (_) {
            Runtime.trap("Unauthorized: Only admins and site engineers can raise bills");
          };
        };
      };
      case null {
        Runtime.trap("Unauthorized: User not found");
      };
    };
  };

  func checkCanApprovePM(caller : Principal) {
    checkUserActive(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (#projectManager) {};
          case (_) {
            Runtime.trap("Unauthorized: Only admins and project managers can approve at PM stage");
          };
        };
      };
      case null {
        Runtime.trap("Unauthorized: User not found");
      };
    };
  };

  func checkCanApproveQC(caller : Principal) {
    checkUserActive(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (#qc) {};
          case (_) {
            Runtime.trap("Unauthorized: Only admins and QC can approve at QC stage");
          };
        };
      };
      case null {
        Runtime.trap("Unauthorized: User not found");
      };
    };
  };

  func checkCanApproveBilling(caller : Principal) {
    checkUserActive(caller);
    switch (users.get(caller)) {
      case (?user) {
        switch (user.role) {
          case (#admin) {};
          case (#billingEngineer) {};
          case (_) {
            Runtime.trap("Unauthorized: Only admins and billing engineers can approve at billing stage");
          };
        };
      };
      case null {
        Runtime.trap("Unauthorized: User not found");
      };
    };
  };

  func checkCanDelete(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete");
    };
    checkUserActive(caller);
  };

  func verifyDeletePassword(password : Text) {
    if (password != DELETE_PASSWORD) {
      Runtime.trap("Incorrect password");
    };
  };

  func isAuthenticatedUser(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.hasPermission(accessControlState, caller, #admin)
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    checkUserActive(caller);
    users.values().toArray();
  };
};
