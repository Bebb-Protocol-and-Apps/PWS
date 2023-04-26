import Types "../Types";
import Blob "mo:base/Blob";
import Principal "mo:base/Principal";

module {

    // The user id used for hasing the user record
    public type FileUserId = Principal;
    
    // The type of the file storage
    public type File = Blob;

    // Defines a common return type for all File requests
    public type FileResult = Types.Result<Text, Types.ApiError>;

    /*
     * Structure is used to store a file with the associated metadata.
     * In the future we can add file visability permissions here
     */
    public type FileInfo = {
        // Stores who the owner of the file is
        owner_principal : Text;
        // Stores the file name, useful for human readableness
        file_name : Text;
        // Stores the actual contents of the file
        file_content : Blob;
    };

    /*
     * Structure is used to store a file user record which keeps track of how much data a single user has saved
     *  and which files that specific user owns
     */
    public type UserRecord = {
        // The total size of files the user has uploaded in Bytes
        totalSize : Nat;
        // The file ids of the files the user owns. The file ids can be used to search in the file database
        file_ids : [Text];
    };

};
