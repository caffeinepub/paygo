import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // --- Types ---
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

  // --- State ---
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

  // --- Helper Functions ---
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

  // --- User Profile Functions (Required by Frontend) ---
  public shared ({ caller }) func getOrCreateMainAdminUser() : async UserProfile {
    switch (users.get(caller)) {
      case (?user) {
        return user;
      };
      case null {
        if (hasAnyUsers()) {
          Runtime.trap("Unauthorized: User does not exist. Contact an administrator to create your account.");
        };

        let user : UserProfile = {
          payGoId = generatePayGoUserId();
          name = "Admin";
          email = MAIN_ADMIN_EMAIL;
          mobile = "";
          role = #admin;
          isActive = true;
          principal = caller;
        };

        users.add(caller, user);
        usersByEmail.add(MAIN_ADMIN_EMAIL, caller);
        AccessControl.assignRole(accessControlState, caller, caller, #admin);

        user;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not isAuthenticatedUser(caller)) {
      return null;
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(userPrincipal : Principal) : async ?UserProfile {
    checkUserExists(caller);
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(userPrincipal);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUserExists(caller);
    checkUserActive(caller);

    switch (users.get(caller)) {
      case (?existingUser) {
        if (existingUser.email != profile.email) {
          switch (usersByEmail.get(profile.email)) {
            case (?existingPrincipal) {
              if (existingPrincipal != caller) {
                Runtime.trap("Email already in use");
              };
            };
            case null {};
          };
          usersByEmail.remove(existingUser.email);
          usersByEmail.add(profile.email, caller);
        };

        if (existingUser.mobile != profile.mobile) {
          switch (usersByMobile.get(profile.mobile)) {
            case (?existingPrincipal) {
              if (existingPrincipal != caller) {
                Runtime.trap("Mobile already in use");
              };
            };
            case null {};
          };
          usersByMobile.remove(existingUser.mobile);
          usersByMobile.add(profile.mobile, caller);
        };

        let updatedUser : UserProfile = {
          existingUser with
          name = profile.name;
          email = profile.email;
          mobile = profile.mobile;
          isActive = profile.isActive;
        };

        users.add(caller, updatedUser);
      };
      case null {
        Runtime.trap("User not found");
      };
    };
  };

  // --- User Management (Admin Only) ---
  public shared ({ caller }) func createUser(
    name : Text,
    email : Text,
    mobile : Text
  ) : async Text {
    checkAdminRole(caller);

    switch (usersByEmail.get(email)) {
      case (?_) { Runtime.trap("Email already exists"); };
      case null {};
    };

    switch (usersByMobile.get(mobile)) {
      case (?_) { Runtime.trap("Mobile already exists"); };
      case null {};
    };

    let role = if (isMainAdmin(email)) { #admin } else { #viewer };
    let payGoId = generatePayGoUserId();
    pendingUsers.add(email, { name; email; mobile; role });
    payGoId;
  };

  public shared ({ caller }) func completePendingUserSetup() : async UserProfile {
    switch (users.get(caller)) {
      case (?existingUser) {
        return existingUser;
      };
      case null {
        let callerEmail = switch (usersByEmail.entries().find(func((email, principal) : (Text, Principal)) : Bool {
          principal == caller
        })) {
          case (?(email, _)) { email };
          case null {
            for ((email, pendingData) in pendingUsers.entries()) {
              let newUser : UserProfile = {
                payGoId = generatePayGoUserId();
                name = pendingData.name;
                email = pendingData.email;
                mobile = pendingData.mobile;
                role = pendingData.role;
                isActive = true;
                principal = caller;
              };

              users.add(caller, newUser);
              usersByEmail.add(pendingData.email, caller);
              usersByMobile.add(pendingData.mobile, caller);
              pendingUsers.remove(email);

              let accessControlRole = if (pendingData.role == #admin) { #admin } else { #user };
              AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

              return newUser;
            };

            Runtime.trap("No pending user setup found for this principal");
          };
        };

        switch (pendingUsers.get(callerEmail)) {
          case (?pendingData) {
            let newUser : UserProfile = {
              payGoId = generatePayGoUserId();
              name = pendingData.name;
              email = pendingData.email;
              mobile = pendingData.mobile;
              role = pendingData.role;
              isActive = true;
              principal = caller;
            };

            users.add(caller, newUser);
            usersByEmail.add(pendingData.email, caller);
            usersByMobile.add(pendingData.mobile, caller);
            pendingUsers.remove(callerEmail);

            let accessControlRole = if (pendingData.role == #admin) { #admin } else { #user };
            AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

            newUser;
          };
          case null {
            Runtime.trap("No pending user setup found");
          };
        };
      };
    };
  };

  public query ({ caller }) func listUsers() : async [UserProfile] {
    checkAdminRole(caller);
    users.values().toArray();
  };

  public shared ({ caller }) func updateUser(
    userPrincipal : Principal,
    name : Text,
    email : Text,
    mobile : Text,
    role : UserRole,
    isActive : Bool
  ) : async () {
    checkAdminRole(caller);

    switch (users.get(userPrincipal)) {
      case (?existingUser) {
        if (isMainAdmin(existingUser.email)) {
          if (email != existingUser.email or role != #admin) {
            Runtime.trap("Cannot modify main admin user");
          };
        };

        if (existingUser.email != email) {
          switch (usersByEmail.get(email)) {
            case (?existingPrincipal) {
              if (existingPrincipal != userPrincipal) {
                Runtime.trap("Email already in use");
              };
            };
            case null {};
          };
          usersByEmail.remove(existingUser.email);
          usersByEmail.add(email, userPrincipal);
        };

        if (existingUser.mobile != mobile) {
          switch (usersByMobile.get(mobile)) {
            case (?existingPrincipal) {
              if (existingPrincipal != userPrincipal) {
                Runtime.trap("Mobile already in use");
              };
            };
            case null {};
          };
          usersByMobile.remove(existingUser.mobile);
          usersByMobile.add(mobile, userPrincipal);
        };

        let finalRole = if (isMainAdmin(email)) { #admin } else { role };

        let updatedUser : UserProfile = {
          payGoId = existingUser.payGoId;
          name;
          email;
          mobile;
          role = finalRole;
          isActive;
          principal = userPrincipal;
        };

        users.add(userPrincipal, updatedUser);
        let accessControlRole = if (finalRole == #admin) { #admin } else { #user };
        AccessControl.assignRole(accessControlState, caller, userPrincipal, accessControlRole);
      };
      case null {
        Runtime.trap("User not found");
      };
    };
  };

  public shared ({ caller }) func deleteUser(userPrincipal : Principal, password : Text) : async () {
    checkAdminRole(caller);
    verifyDeletePassword(password);

    switch (users.get(userPrincipal)) {
      case (?user) {
        if (isMainAdmin(user.email)) {
          Runtime.trap("Cannot delete main admin user");
        };

        users.remove(userPrincipal);
        usersByEmail.remove(user.email);
        usersByMobile.remove(user.mobile);
        AccessControl.assignRole(accessControlState, caller, userPrincipal, #guest);
      };
      case null {
        Runtime.trap("User not found");
      };
    };
  };

  // --- Project Management ---
  public shared ({ caller }) func createProject(
    projectName : Text,
    clientName : Text,
    startDate : Text,
    estimatedBudget : Float,
    contactNumber : Text,
    siteAddress : Text,
    locationLink1 : Text,
    officeAddress : Text,
    locationLink2 : Text,
    note : Text
  ) : async Text {
    checkUserExists(caller);
    checkUserActive(caller);

    let id = "PRJ-" # nextProjectId.toText();
    nextProjectId += 1;

    let project : Project = {
      id;
      projectName;
      clientName;
      startDate;
      estimatedBudget;
      contactNumber;
      siteAddress;
      locationLink1;
      officeAddress;
      locationLink2;
      note;
      status = "Active";
    };

    projects.add(id, project);
    id;
  };

  public shared ({ caller }) func listProjects() : async [Project] {
    checkUserExists(caller);
    checkUserActive(caller);
    projects.values().toArray();
  };

  public shared ({ caller }) func updateProject(
    id : Text,
    projectName : Text,
    clientName : Text,
    startDate : Text,
    estimatedBudget : Float,
    contactNumber : Text,
    siteAddress : Text,
    locationLink1 : Text,
    officeAddress : Text,
    locationLink2 : Text,
    note : Text,
    status : Text
  ) : async () {
    checkUserExists(caller);
    checkUserActive(caller);

    switch (projects.get(id)) {
      case (?_) {
        let project : Project = {
          id;
          projectName;
          clientName;
          startDate;
          estimatedBudget;
          contactNumber;
          siteAddress;
          locationLink1;
          officeAddress;
          locationLink2;
          note;
          status;
        };
        projects.add(id, project);
      };
      case null {
        Runtime.trap("Project not found");
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (projects.get(id)) {
      case (?_) {
        projects.remove(id);
      };
      case null {
        Runtime.trap("Project not found");
      };
    };
  };

  // --- Contractor Management ---
  public shared ({ caller }) func createContractor(
    date : Text,
    project : Text,
    contractorName : Text,
    trade : Text,
    unit : Text,
    unitPrice : Float,
    estimatedQty : Float,
    estimatedAmount : Float,
    mobile : Text,
    email : Text,
    address : Text,
    attachments : [Text]
  ) : async Text {
    checkUserExists(caller);
    checkUserActive(caller);

    let id = "CTR-" # nextContractorId.toText();
    nextContractorId += 1;

    let contractor : Contractor = {
      id;
      date;
      project;
      contractorName;
      trade;
      unit;
      unitPrice;
      estimatedQty;
      estimatedAmount;
      mobile;
      email;
      address;
      attachments;
    };

    contractors.add(id, contractor);
    id;
  };

  public shared ({ caller }) func listContractors() : async [Contractor] {
    checkUserExists(caller);
    checkUserActive(caller);
    contractors.values().toArray();
  };

  public shared ({ caller }) func updateContractor(
    id : Text,
    date : Text,
    project : Text,
    contractorName : Text,
    trade : Text,
    unit : Text,
    unitPrice : Float,
    estimatedQty : Float,
    estimatedAmount : Float,
    mobile : Text,
    email : Text,
    address : Text,
    attachments : [Text]
  ) : async () {
    checkUserExists(caller);
    checkUserActive(caller);

    switch (contractors.get(id)) {
      case (?_) {
        let contractor : Contractor = {
          id;
          date;
          project;
          contractorName;
          trade;
          unit;
          unitPrice;
          estimatedQty;
          estimatedAmount;
          mobile;
          email;
          address;
          attachments;
        };
        contractors.add(id, contractor);
      };
      case null {
        Runtime.trap("Contractor not found");
      };
    };
  };

  public shared ({ caller }) func deleteContractor(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (contractors.get(id)) {
      case (?_) {
        contractors.remove(id);
      };
      case null {
        Runtime.trap("Contractor not found");
      };
    };
  };

  // --- Bill Management ---
  func generateBillNumber(projectName : Text) : Text {
    let prefix = projectName.trimStart(#predicate(func c { c != ' ' })).trimStart(#predicate(func c { c == ' ' }));
    let counter = switch (billNumberCounters.get(prefix)) {
      case (?count) { count + 1 };
      case null { 1 };
    };
    billNumberCounters.add(prefix, counter);
    prefix # " " # padZeros(counter, 3);
  };

  public shared ({ caller }) func createBill(
    contractor : Text,
    project : Text,
    projectDate : Text,
    trade : Text,
    unit : Text,
    unitPrice : Float,
    quantity : Float,
    description : Text,
    location : Text
  ) : async Text {
    checkCanRaiseBill(caller);

    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found"); };
    };

    let projectData = switch (projects.get(project)) {
      case (?p) { p };
      case null { Runtime.trap("Project not found"); };
    };

    let id = "BILL-" # nextBillId.toText();
    nextBillId += 1;

    let billNumber = generateBillNumber(projectData.projectName);
    let total = unitPrice * quantity;

    let bill : Bill = {
      id;
      billNumber;
      contractor;
      project;
      projectDate;
      trade;
      unit;
      unitPrice;
      quantity;
      total;
      description;
      location;
      authorizedEngineer = user.name;
      pmApproved = false;
      pmDebit = 0.0;
      pmNote = "";
      qcApproved = false;
      qcDebit = 0.0;
      qcNote = "";
      billingApproved = false;
      finalAmount = total;
      status = "PM Pending";
      createdBy = caller;
    };

    bills.add(id, bill);
    id;
  };

  public shared ({ caller }) func listBills() : async [Bill] {
    checkUserExists(caller);
    checkUserActive(caller);
    bills.values().toArray();
  };

  public shared ({ caller }) func approveBillPM(id : Text, approved : Bool, debit : Float, note : Text) : async () {
    checkCanApprovePM(caller);

    switch (bills.get(id)) {
      case (?bill) {
        if (bill.pmApproved) {
          Runtime.trap("Bill already approved by PM");
        };

        let newFinalAmount = bill.total - debit - bill.qcDebit;
        let newStatus = if (approved) { "PM Approved | QC Pending" } else { "PM Rejected" };

        let updatedBill : Bill = {
          id = bill.id;
          billNumber = bill.billNumber;
          contractor = bill.contractor;
          project = bill.project;
          projectDate = bill.projectDate;
          trade = bill.trade;
          unit = bill.unit;
          unitPrice = bill.unitPrice;
          quantity = bill.quantity;
          total = bill.total;
          description = bill.description;
          location = bill.location;
          authorizedEngineer = bill.authorizedEngineer;
          pmApproved = approved;
          pmDebit = debit;
          pmNote = note;
          qcApproved = bill.qcApproved;
          qcDebit = bill.qcDebit;
          qcNote = bill.qcNote;
          billingApproved = bill.billingApproved;
          finalAmount = newFinalAmount;
          status = newStatus;
          createdBy = bill.createdBy;
        };

        bills.add(id, updatedBill);
      };
      case null {
        Runtime.trap("Bill not found");
      };
    };
  };

  public shared ({ caller }) func approveBillQC(id : Text, approved : Bool, debit : Float, note : Text) : async () {
    checkCanApproveQC(caller);

    switch (bills.get(id)) {
      case (?bill) {
        if (not bill.pmApproved) {
          Runtime.trap("Bill must be approved by PM first");
        };
        if (bill.qcApproved) {
          Runtime.trap("Bill already approved by QC");
        };

        let newFinalAmount = bill.total - bill.pmDebit - debit;
        let newStatus = if (approved) { "QC Approved | Billing Pending" } else { "QC Rejected" };

        let updatedBill : Bill = {
          id = bill.id;
          billNumber = bill.billNumber;
          contractor = bill.contractor;
          project = bill.project;
          projectDate = bill.projectDate;
          trade = bill.trade;
          unit = bill.unit;
          unitPrice = bill.unitPrice;
          quantity = bill.quantity;
          total = bill.total;
          description = bill.description;
          location = bill.location;
          authorizedEngineer = bill.authorizedEngineer;
          pmApproved = bill.pmApproved;
          pmDebit = bill.pmDebit;
          pmNote = bill.pmNote;
          qcApproved = approved;
          qcDebit = debit;
          qcNote = note;
          billingApproved = bill.billingApproved;
          finalAmount = newFinalAmount;
          status = newStatus;
          createdBy = bill.createdBy;
        };

        bills.add(id, updatedBill);
      };
      case null {
        Runtime.trap("Bill not found");
      };
    };
  };

  public shared ({ caller }) func approveBillBilling(id : Text, approved : Bool) : async () {
    checkCanApproveBilling(caller);

    switch (bills.get(id)) {
      case (?bill) {
        if (not bill.pmApproved or not bill.qcApproved) {
          Runtime.trap("Bill must be approved by PM and QC first");
        };
        if (bill.billingApproved) {
          Runtime.trap("Bill already approved by Billing");
        };

        let newStatus = if (approved) { "Completed" } else { "Billing Rejected" };

        let updatedBill : Bill = {
          id = bill.id;
          billNumber = bill.billNumber;
          contractor = bill.contractor;
          project = bill.project;
          projectDate = bill.projectDate;
          trade = bill.trade;
          unit = bill.unit;
          unitPrice = bill.unitPrice;
          quantity = bill.quantity;
          total = bill.total;
          description = bill.description;
          location = bill.location;
          authorizedEngineer = bill.authorizedEngineer;
          pmApproved = bill.pmApproved;
          pmDebit = bill.pmDebit;
          pmNote = bill.pmNote;
          qcApproved = bill.qcApproved;
          qcDebit = bill.qcDebit;
          qcNote = bill.qcNote;
          billingApproved = approved;
          finalAmount = bill.finalAmount;
          status = newStatus;
          createdBy = bill.createdBy;
        };

        bills.add(id, updatedBill);
      };
      case null {
        Runtime.trap("Bill not found");
      };
    };
  };

  public shared ({ caller }) func deleteBill(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (bills.get(id)) {
      case (?_) {
        bills.remove(id);
      };
      case null {
        Runtime.trap("Bill not found");
      };
    };
  };

  // --- NMR Management ---
  public shared ({ caller }) func createNMR(
    project : Text,
    contractor : Text,
    weekStartDate : Text,
    weekEndDate : Text,
    entries : [NMREntry]
  ) : async Text {
    checkCanRaiseBill(caller);

    let user = switch (users.get(caller)) {
      case (?u) { u };
      case null { Runtime.trap("User not found"); };
    };

    let id = "NMR-" # nextNMRId.toText();
    nextNMRId += 1;

    var totalAmount : Float = 0.0;
    for (entry in entries.vals()) {
      totalAmount += entry.amount;
    };

    let nmr : NMR = {
      id;
      project;
      contractor;
      trade = "NMR";
      weekStartDate;
      weekEndDate;
      engineerName = user.name;
      entries;
      pmApproved = false;
      pmDebit = 0.0;
      pmNote = "";
      qcApproved = false;
      qcDebit = 0.0;
      qcNote = "";
      billingApproved = false;
      finalAmount = totalAmount;
      status = "PM Pending";
      createdBy = caller;
    };

    nmrs.add(id, nmr);
    id;
  };

  public shared ({ caller }) func listNMRs() : async [NMR] {
    checkUserExists(caller);
    checkUserActive(caller);
    nmrs.values().toArray();
  };

  public shared ({ caller }) func approveNMRPM(id : Text, approved : Bool, debit : Float, note : Text) : async () {
    checkCanApprovePM(caller);

    switch (nmrs.get(id)) {
      case (?nmr) {
        if (nmr.pmApproved) {
          Runtime.trap("NMR already approved by PM");
        };

        let newFinalAmount = nmr.finalAmount - debit - nmr.qcDebit;
        let newStatus = if (approved) { "PM Approved | QC Pending" } else { "PM Rejected" };

        let updatedNMR : NMR = {
          id = nmr.id;
          project = nmr.project;
          contractor = nmr.contractor;
          trade = nmr.trade;
          weekStartDate = nmr.weekStartDate;
          weekEndDate = nmr.weekEndDate;
          engineerName = nmr.engineerName;
          entries = nmr.entries;
          pmApproved = approved;
          pmDebit = debit;
          pmNote = note;
          qcApproved = nmr.qcApproved;
          qcDebit = nmr.qcDebit;
          qcNote = nmr.qcNote;
          billingApproved = nmr.billingApproved;
          finalAmount = newFinalAmount;
          status = newStatus;
          createdBy = nmr.createdBy;
        };

        nmrs.add(id, updatedNMR);
      };
      case null {
        Runtime.trap("NMR not found");
      };
    };
  };

  public shared ({ caller }) func approveNMRQC(id : Text, approved : Bool, debit : Float, note : Text) : async () {
    checkCanApproveQC(caller);

    switch (nmrs.get(id)) {
      case (?nmr) {
        if (not nmr.pmApproved) {
          Runtime.trap("NMR must be approved by PM first");
        };
        if (nmr.qcApproved) {
          Runtime.trap("NMR already approved by QC");
        };

        let newFinalAmount = nmr.finalAmount - nmr.pmDebit - debit;
        let newStatus = if (approved) { "QC Approved | Billing Pending" } else { "QC Rejected" };

        let updatedNMR : NMR = {
          id = nmr.id;
          project = nmr.project;
          contractor = nmr.contractor;
          trade = nmr.trade;
          weekStartDate = nmr.weekStartDate;
          weekEndDate = nmr.weekEndDate;
          engineerName = nmr.engineerName;
          entries = nmr.entries;
          pmApproved = nmr.pmApproved;
          pmDebit = nmr.pmDebit;
          pmNote = nmr.pmNote;
          qcApproved = approved;
          qcDebit = debit;
          qcNote = note;
          billingApproved = nmr.billingApproved;
          finalAmount = newFinalAmount;
          status = newStatus;
          createdBy = nmr.createdBy;
        };

        nmrs.add(id, updatedNMR);
      };
      case null {
        Runtime.trap("NMR not found");
      };
    };
  };

  public shared ({ caller }) func approveNMRBilling(id : Text, approved : Bool) : async () {
    checkCanApproveBilling(caller);

    switch (nmrs.get(id)) {
      case (?nmr) {
        if (not nmr.pmApproved or not nmr.qcApproved) {
          Runtime.trap("NMR must be approved by PM and QC first");
        };
        if (nmr.billingApproved) {
          Runtime.trap("NMR already approved by Billing");
        };

        let newStatus = if (approved) { "Completed" } else { "Billing Rejected" };

        let updatedNMR : NMR = {
          id = nmr.id;
          project = nmr.project;
          contractor = nmr.contractor;
          trade = nmr.trade;
          weekStartDate = nmr.weekStartDate;
          weekEndDate = nmr.weekEndDate;
          engineerName = nmr.engineerName;
          entries = nmr.entries;
          pmApproved = nmr.pmApproved;
          pmDebit = nmr.pmDebit;
          pmNote = nmr.pmNote;
          qcApproved = nmr.qcApproved;
          qcDebit = nmr.qcDebit;
          qcNote = nmr.qcNote;
          billingApproved = approved;
          finalAmount = nmr.finalAmount;
          status = newStatus;
          createdBy = nmr.createdBy;
        };

        nmrs.add(id, updatedNMR);
      };
      case null {
        Runtime.trap("NMR not found");
      };
    };
  };

  public shared ({ caller }) func deleteNMR(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (nmrs.get(id)) {
      case (?_) {
        nmrs.remove(id);
      };
      case null {
        Runtime.trap("NMR not found");
      };
    };
  };

  // --- Payment Management ---
  func generatePaymentId(date : Text) : Text {
    let dateKey = date.replace(#char '-', "");
    let counter = switch (paymentCounters.get(dateKey)) {
      case (?count) { count + 1 };
      case null { 1 };
    };
    paymentCounters.add(dateKey, counter);
    "P" # dateKey # padZeros(counter, 3);
  };

  func calculatePaymentStatus(paidAmount : Float, billTotal : Float) : Text {
    if (paidAmount == 0.0) {
      "Pending";
    } else if (paidAmount < billTotal) {
      "Partially Paid";
    } else {
      "Completed";
    };
  };

  public shared ({ caller }) func createPayment(
    billNumber : Text,
    paymentDate : Text,
    paidAmount : Float
  ) : async Text {
    checkUserExists(caller);
    checkUserActive(caller);

    let bill = bills.values().find(func(b : Bill) : Bool { b.billNumber == billNumber });

    switch (bill) {
      case (?b) {
        if (not b.billingApproved) {
          Runtime.trap("Bill must be approved before payment");
        };

        let id = "PAY-" # nextPaymentId.toText();
        nextPaymentId += 1;

        let paymentId = generatePaymentId(paymentDate);

        let existingPayments = payments.values().filter(func(p : Payment) : Bool {
          p.billNumber == billNumber;
        });

        var totalPaid : Float = paidAmount;
        for (p in existingPayments) {
          totalPaid += p.paidAmount;
        };

        let balance = b.finalAmount - totalPaid;
        let status = calculatePaymentStatus(totalPaid, b.finalAmount);

        let payment : Payment = {
          id;
          paymentId;
          billNumber;
          paymentDate;
          project = b.project;
          contractor = b.contractor;
          billTotal = b.finalAmount;
          paidAmount;
          balance;
          status;
          createdBy = caller;
        };

        payments.add(id, payment);
        id;
      };
      case null {
        Runtime.trap("Bill not found or not approved");
      };
    };
  };

  public shared ({ caller }) func listPayments() : async [Payment] {
    checkUserExists(caller);
    checkUserActive(caller);
    payments.values().toArray();
  };

  public shared ({ caller }) func deletePayment(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (payments.get(id)) {
      case (?_) {
        payments.remove(id);
      };
      case null {
        Runtime.trap("Payment not found");
      };
    };
  };
};
