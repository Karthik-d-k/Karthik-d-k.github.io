+++
title = "Matlab/Simulink Model Reducer"
date = 2024-05-16
+++


## Context

In automotive engine control unit (ECU) software, we use global constants called **variant coding** constants to enable or disable specific features. These constants are part of every functional unit within the entire ECU software. Most software development for ECUs is done using tools like **ASCET** and sometimes **Matlab/Simulink**, depending on the team and the specific functional unit.

Both ASCET and Matlab/Simulink are model-based code generators. Instead of writing code manually, developers create flow diagrams by dragging and dropping basic and user-defined classes/blocks. These diagrams represent the required functionality of an ECU sub-system, and the tools generate the corresponding C code.

Each sub-system (functional unit) has its own set of variant coding constants, which enable or disable features based on the customer's requirements. ASCET has a built-in tool called **model_reducer**. This tool uses a global CSV file (**variant_coding.csv**) containing all the variant coding constants for the entire ECU software. By referencing this CSV file, ASCET can generate a reduced version of the model to enable or disable specific feature blocks.

## Problem

In **Matlab/Simulink**, we need to manually update each **variant coding** value within the **Simulink data dictionary (sldd)** file based on the global CSV file. This manual process is error-prone and time-consuming for developers. To address this, we can automate the task using a script.


## Solution

Our script should take two input files: the **variant_coding.csv** file and the **model.sldd** file. It should then output a modified **model_modified.sldd** file and an updated **variant_coding_modified.csv** file.

Here's a high-level overview of how to write this script in Matlab.
This function takes the input CSV and sldd files and generates the required modified files.

```matlab
function matlab_reducer(variant_coding_csv, model_sldd)
    variant_coding_values = csv2dict(variant_coding_csv);
    variant_coding_modified_values = modify_sldd(model_sldd, variant_coding_values);
    write_csv(variant_coding_modified_values);
end
```

In the following sections, I will explain the individual components needed to achieve this outcome.

**csv2dict** will read the csv file and stores the values along with names in a dictionary.

```matlab
function variant_coding_values = csv2dict(filename)
    % Read the CSV file
    data = readtable(filename, 'Format', '%s%f');

    % Extract the first and second columns
    keys = data.Var1;
    values = data.Var2;

    % Create a dictionary
    variant_coding_values = containers.Map(keys, values);
end
```

**modify_sldd** function will modify the values present in the sldd file with values we read from csv file.
We read the **Design Data** section from sldd file and then we export the values to a .mat file which is 
necessary to modify the values. we just search all the VCs in dictionary and grad the values and rewrite with updated values and save to a
new .mat file. THis file is then used to update and save the modified sldd file.

```matlab
function modified_vc_data = modify_sldd(model_sldd, variant_coding_values)
    % Read the sldd file
    sldd_dict = Simulink.data.dictionary.open(model_sldd);
    sldd_data = getSection(sldd_dict, 'Design Data');
    
    % Save sldd data into a .mat file
    exportToFile(sldd_data, 'sldd_data.mat');
    
    % Load VC/Vars/.. mat file
    vc_data = load('sldd_data.mat');
    vc_names = fieldnames(vc_data);
    vc_data_new = struct();

    % Create a cell array to store the output
    modified_vc_data = cell(0, 3);

    for i = 1:numel(vc_names)
        vc_name = vc_names{i};
        vc_value = vc_data.(vc_name);

        % Check if the field value is of the type 'VC.Const'
        if isa(vc_value, 'VC.Const')
            % Check if the VC exists in variant_coding_values
            if isKey(variant_coding_values, vc_name)
                old_value = vc_data.(vc_name).Value;

                vc_value_from_csv = variant_coding_values(vc_name);
                % Change VC value as per variant_coding_values file
                if strcmp(vc_data.(vc_name).DataType, 'boolean')
                    vc_data.(vc_name).Value = logical(vc_value_from_csv);
                else
                    vc_data.(vc_name).Value = vc_value_from_csv;
                end
                vc_data_new.(vc_name) = vc_data.(vc_name);

                new_value = vc_data.(vc_name).Value;

                % Add the data to the modified_vc_data cell array
                modified_vc_data = [modified_vc_data; {vc_name, old_value, new_value}];
            end
        end
    end
    
    % Modify sldd file w/ modified VC values
    save('vc_data_new.mat', '-struct', 'vc_data_new')
    importFromFile(sldd_data, 'vc_data_new.mat', 'existingVarsAction', 'overwrite');
    sldd_dict.saveChanges();

    % Close all connections to all open data dictionaries
    Simulink.data.dictionary.closeAll();
end
```

**write_csv** function will just create a new csv with old and new values for all variant coding constants present in the model.
 
```matlab
function write_csv(variant_coding_modified_values)
    % Create a new CSV file with the output data
    output_filename = 'variant_coding_modified.csv';
    fid = fopen(output_filename, 'w');
    fprintf(fid, 'variant coding Name,Old Value,New Value\n'); % Write header

    % Write data to the CSV file
    for i = 1:size(variant_coding_modified_values, 1)
        fprintf(fid, '%s,%d,%d\n', variant_coding_modified_values{i,:});
    end

    fclose(fid);
end
```


## Conclusion

- Full script is available on github [**matlab_reducer.m**](https://github.com/Karthik-d-k/Karthik-d-k.github.io/blob/main/content/scripts/matlab_reducer.m)


- Thanks to my friend [**Vijeth Angadi**](https://github.com/Vijeth400) for reviewing the draft version of this blog.
