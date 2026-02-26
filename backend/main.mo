import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
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

  var bootstrapDone = false;
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
    AccessControl.hasPermission(accessControlState, caller, #user) or AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  // -----------------------------------------------------------------------
  // Login / auto-profile creation
  // -----------------------------------------------------------------------
  public shared ({ caller }) func login() : async UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot log in");
    };

    switch (users.get(caller)) {
      case (?profile) {
        return profile;
      };
      case null {};
    };

    let (appRole, acRole) : (UserRole, AccessControl.UserRole) = if (not bootstrapDone) {
      bootstrapDone := true;
      (#admin, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
      (#viewer, #user);
    };

    let payGoId = generatePayGoUserId();
    let profile : UserProfile = {
      payGoId = payGoId;
      name = "";
      email = "";
      mobile = "";
      role = appRole;
      isActive = true;
      principal = caller;
      createdAt = 0;
    };

    users.add(caller, profile);
    profile;
  };

  // -----------------------------------------------------------------------
  // Standard profile accessors required by the frontend
  // -----------------------------------------------------------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot access profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can access their profile");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot save profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save their profile");
    };
    checkUserActive(caller);

    let existing = switch (users.get(caller)) {
      case (?p) { p };
      case null {
        Runtime.trap("User not found. Please log in first.");
      };
    };

    let updated : UserProfile = {
      payGoId = existing.payGoId;
      name = profile.name;
      email = profile.email;
      mobile = profile.mobile;
      role = existing.role;
      isActive = existing.isActive;
      principal = existing.principal;
      createdAt = existing.createdAt;
    };

    if (existing.email != "" and existing.email != updated.email) {
      usersByEmail.remove(existing.email);
    };
    if (updated.email != "") {
      usersByEmail.add(updated.email, caller);
    };

    if (existing.mobile != "" and existing.mobile != updated.mobile) {
      usersByMobile.remove(existing.mobile);
    };
    if (updated.mobile != "") {
      usersByMobile.add(updated.mobile, caller);
    };

    users.add(caller, updated);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // -----------------------------------------------------------------------
  // ENFORCE ADMIN-ONLY ACCESS TO updateUserRole
  // -----------------------------------------------------------------------
  public shared ({ caller }) func updateUserRole(
    targetUser : Principal,
    newRole : UserRole,
    isActive : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change roles or activate/deactivate users");
    };

    let existing = switch (users.get(targetUser)) {
      case (?p) { p };
      case null { Runtime.trap("Target user not found") };
    };

    let acRole : AccessControl.UserRole = switch (newRole) {
      case (#admin) { #admin };
      case (_) { #user };
    };

    AccessControl.assignRole(accessControlState, caller, targetUser, acRole);

    let updated : UserProfile = {
      payGoId = existing.payGoId;
      name = existing.name;
      email = existing.email;
      mobile = existing.mobile;
      role = newRole;
      isActive = isActive;
      principal = existing.principal;
      createdAt = existing.createdAt;
    };
    users.add(targetUser, updated);
  };

  // -----------------------------------------------------------------------
  // User management (admin only)
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    checkUserActive(caller);
    users.values().toArray();
  };

  public shared ({ caller }) func deleteUser(targetUser : Principal, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);

    switch (users.get(targetUser)) {
      case (?profile) {
        if (profile.email != "") { usersByEmail.remove(profile.email) };
        if (profile.mobile != "") { usersByMobile.remove(profile.mobile) };
      };
      case null { Runtime.trap("User not found") };
    };
    users.remove(targetUser);
  };

  // -----------------------------------------------------------------------
  // Projects
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not isAuthenticatedUser(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    checkUserActive(caller);
    projects.values().toArray();
  };

  public shared ({ caller }) func createProject(project : Project) : async Project {
    checkAdminRole(caller);
    projects.add(project.id, project);
    project;
  };

  public shared ({ caller }) func updateProject(project : Project) : async Project {
    checkAdminRole(caller);
    switch (projects.get(project.id)) {
      case null { Runtime.trap("Project not found") };
      case (?_) {};
    };
    projects.add(project.id, project);
    project;
  };

  public shared ({ caller }) func deleteProject(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);
    switch (projects.get(id)) {
      case null { Runtime.trap("Project not found") };
      case (?_) {};
    };
    projects.remove(id);
  };

  // -----------------------------------------------------------------------
  // Contractors
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllContractors() : async [Contractor] {
    if (not isAuthenticatedUser(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    checkUserActive(caller);
    contractors.values().toArray();
  };

  public shared ({ caller }) func createContractor(contractor : Contractor) : async Contractor {
    checkAdminRole(caller);
    contractors.add(contractor.id, contractor);
    contractor;
  };

  public shared ({ caller }) func updateContractor(contractor : Contractor) : async Contractor {
    checkAdminRole(caller);
    switch (contractors.get(contractor.id)) {
      case null { Runtime.trap("Contractor not found") };
      case (?_) {};
    };
    contractors.add(contractor.id, contractor);
    contractor;
  };

  public shared ({ caller }) func deleteContractor(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);
    switch (contractors.get(id)) {
      case null { Runtime.trap("Contractor not found") };
      case (?_) {};
    };
    contractors.remove(id);
  };

  // -----------------------------------------------------------------------
  // Bills
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not isAuthenticatedUser(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    checkUserActive(caller);
    bills.values().toArray();
  };

  public shared ({ caller }) func createBill(bill : Bill) : async Bill {
    checkCanRaiseBill(caller);
    let billWithCreator : Bill = {
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
      billingApproved = bill.billingApproved;
      finalAmount = bill.finalAmount;
      status = bill.status;
      createdBy = caller;
    };
    bills.add(billWithCreator.id, billWithCreator);
    billWithCreator;
  };

  public shared ({ caller }) func updateBillPMApproval(
    billId : Text,
    pmApproved : Bool,
    pmDebit : Float,
    pmNote : Text,
  ) : async Bill {
    checkCanApprovePM(caller);
    let bill = switch (bills.get(billId)) {
      case null { Runtime.trap("Bill not found") };
      case (?b) { b };
    };
    let updated : Bill = {
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
      pmApproved = pmApproved;
      pmDebit = pmDebit;
      pmNote = pmNote;
      qcApproved = bill.qcApproved;
      qcDebit = bill.qcDebit;
      qcNote = bill.qcNote;
      billingApproved = bill.billingApproved;
      finalAmount = bill.finalAmount;
      status = bill.status;
      createdBy = bill.createdBy;
    };
    bills.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func updateBillQCApproval(
    billId : Text,
    qcApproved : Bool,
    qcDebit : Float,
    qcNote : Text,
  ) : async Bill {
    checkCanApproveQC(caller);
    let bill = switch (bills.get(billId)) {
      case null { Runtime.trap("Bill not found") };
      case (?b) { b };
    };
    let updated : Bill = {
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
      qcApproved = qcApproved;
      qcDebit = qcDebit;
      qcNote = qcNote;
      billingApproved = bill.billingApproved;
      finalAmount = bill.finalAmount;
      status = bill.status;
      createdBy = bill.createdBy;
    };
    bills.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func updateBillBillingApproval(
    billId : Text,
    billingApproved : Bool,
    finalAmount : Float,
    status : Text,
  ) : async Bill {
    checkCanApproveBilling(caller);
    let bill = switch (bills.get(billId)) {
      case null { Runtime.trap("Bill not found") };
      case (?b) { b };
    };
    let updated : Bill = {
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
      billingApproved = billingApproved;
      finalAmount = finalAmount;
      status = status;
      createdBy = bill.createdBy;
    };
    bills.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteBill(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);
    switch (bills.get(id)) {
      case null { Runtime.trap("Bill not found") };
      case (?_) {};
    };
    bills.remove(id);
  };

  // -----------------------------------------------------------------------
  // NMRs
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllNMRs() : async [NMR] {
    if (not isAuthenticatedUser(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    checkUserActive(caller);
    nmrs.values().toArray();
  };

  public shared ({ caller }) func createNMR(nmr : NMR) : async NMR {
    checkCanRaiseBill(caller);
    let nmrWithCreator : NMR = {
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
      billingApproved = nmr.billingApproved;
      finalAmount = nmr.finalAmount;
      status = nmr.status;
      createdBy = caller;
    };
    nmrs.add(nmrWithCreator.id, nmrWithCreator);
    nmrWithCreator;
  };

  public shared ({ caller }) func updateNMRPMApproval(
    nmrId : Text,
    pmApproved : Bool,
    pmDebit : Float,
    pmNote : Text,
  ) : async NMR {
    checkCanApprovePM(caller);
    let nmr = switch (nmrs.get(nmrId)) {
      case null { Runtime.trap("NMR not found") };
      case (?n) { n };
    };
    let updated : NMR = {
      id = nmr.id;
      project = nmr.project;
      contractor = nmr.contractor;
      trade = nmr.trade;
      weekStartDate = nmr.weekStartDate;
      weekEndDate = nmr.weekEndDate;
      engineerName = nmr.engineerName;
      entries = nmr.entries;
      pmApproved = pmApproved;
      pmDebit = pmDebit;
      pmNote = pmNote;
      qcApproved = nmr.qcApproved;
      qcDebit = nmr.qcDebit;
      qcNote = nmr.qcNote;
      billingApproved = nmr.billingApproved;
      finalAmount = nmr.finalAmount;
      status = nmr.status;
      createdBy = nmr.createdBy;
    };
    nmrs.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func updateNMRQCApproval(
    nmrId : Text,
    qcApproved : Bool,
    qcDebit : Float,
    qcNote : Text,
  ) : async NMR {
    checkCanApproveQC(caller);
    let nmr = switch (nmrs.get(nmrId)) {
      case null { Runtime.trap("NMR not found") };
      case (?n) { n };
    };
    let updated : NMR = {
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
      qcApproved = qcApproved;
      qcDebit = qcDebit;
      qcNote = qcNote;
      billingApproved = nmr.billingApproved;
      finalAmount = nmr.finalAmount;
      status = nmr.status;
      createdBy = nmr.createdBy;
    };
    nmrs.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func updateNMRBillingApproval(
    nmrId : Text,
    billingApproved : Bool,
    finalAmount : Float,
    status : Text,
  ) : async NMR {
    checkCanApproveBilling(caller);
    let nmr = switch (nmrs.get(nmrId)) {
      case null { Runtime.trap("NMR not found") };
      case (?n) { n };
    };
    let updated : NMR = {
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
      billingApproved = billingApproved;
      finalAmount = finalAmount;
      status = status;
      createdBy = nmr.createdBy;
    };
    nmrs.add(updated.id, updated);
    updated;
  };

  public shared ({ caller }) func deleteNMR(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);
    switch (nmrs.get(id)) {
      case null { Runtime.trap("NMR not found") };
      case (?_) {};
    };
    nmrs.remove(id);
  };

  // -----------------------------------------------------------------------
  // Payments
  // -----------------------------------------------------------------------

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not isAuthenticatedUser(caller)) {
      Runtime.trap("Unauthorized: Must be a registered user");
    };
    checkUserActive(caller);
    payments.values().toArray();
  };

  public shared ({ caller }) func createPayment(payment : Payment) : async Payment {
    checkCanApproveBilling(caller);
    let paymentWithCreator : Payment = {
      id = payment.id;
      paymentId = payment.paymentId;
      billNumber = payment.billNumber;
      paymentDate = payment.paymentDate;
      project = payment.project;
      contractor = payment.contractor;
      billTotal = payment.billTotal;
      paidAmount = payment.paidAmount;
      balance = payment.balance;
      status = payment.status;
      createdBy = caller;
    };
    payments.add(paymentWithCreator.id, paymentWithCreator);
    paymentWithCreator;
  };

  public shared ({ caller }) func deletePayment(id : Text, password : Text) : async () {
    checkCanDelete(caller);
    verifyDeletePassword(password);
    switch (payments.get(id)) {
      case null { Runtime.trap("Payment not found") };
      case (?_) {};
    };
    payments.remove(id);
  };
};
