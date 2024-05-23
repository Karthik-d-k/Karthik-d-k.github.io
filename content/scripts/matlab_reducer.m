%% matlab_reducer
%  --------------
% Script to modify Variant coding constants inside sldd file based on global csv file.
%
%
% Usage:
%   matlab_reducer('variant_coding.csv', 'model.sldd');
%
% Inputs:
%   variant_coding.csv - Path to global variant codiing constants csv file.
%   model.sldd         - Path to an sldd file.
%
% Outputs:
%   variant_coding_modified.csv - All modified VC values will be saved here.
%   model_modified.sldd         - Modified sldd file.
%

function matlab_reducer(variant_coding_csv, model_sldd)
    variant_coding_values = csv2dict(variant_coding_csv);
    variant_coding_modified_values = modify_sldd(model_sldd, variant_coding_values);
    write_csv(variant_coding_modified_values);
end

function variant_coding_values = csv2dict(filename)
    % Read the CSV file
    data = readtable(filename, 'Format', '%s%f');

    % Extract the first and second columns
    keys = data.Var1;
    values = data.Var2;

    % Create a dictionary
    variant_coding_values = containers.Map(keys, values);
end

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
