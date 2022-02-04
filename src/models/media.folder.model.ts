import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";
import { MediaFilesInstance } from "./media.files.model";

export interface MediaFolderAttributes {
  folder_id: string;
  parent_id: string | null;
  name: string;
  desc: string;
  icon: string;
  created_by: string;
}

interface MediaFolderCreationAttributes
  extends Optional<
    MediaFolderAttributes,
    "folder_id" | "parent_id" | "desc" | "icon"
  > {}

export interface MediaFolderInstance
  extends Model<MediaFolderAttributes, MediaFolderCreationAttributes>,
    MediaFolderAttributes {
  setDataValue: (key: any, val: any) => void;
  folders: MediaFolderInstance[];
  files: MediaFilesInstance[];
}

//--> Model attributes
export const MediaFolderModelAttributes: SequelizeAttributes<MediaFolderAttributes> =
  {
    folder_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: "MediaFolder Id",
      allowNull: false,
      unique: true,
    },
    parent_id: DataTypes.STRING,
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc: DataTypes.STRING,
    icon: DataTypes.STRING,
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Creator of the folder",
    },
  };

// --> Factory....
export function MediaFolderFactory(sequelize: Sequelize) {
  const MediaFolder = <ModelStatic<MediaFolderInstance>>sequelize.define(
    "MediaFolder",
    MediaFolderModelAttributes as any,
    {
      timestamps: true,
      tableName: "MediaFolder",
      freezeTableName: true,
    }
  );

  MediaFolder.associate = function (models: ModelRegistry) {
    const { MediaFolder } = models;

    MediaFolder.hasMany(models.MediaFiles, {
      as: "files",
      foreignKey: "folder_id",
      sourceKey: "folder_id",
      onDelete: "CASCADE",
    });

    MediaFolder.hasMany(models.MediaFolder, {
      as: "folders",
      foreignKey: "parent_id",
      sourceKey: "folder_id",
    });
  };

  MediaFolder.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return MediaFolder;
}
