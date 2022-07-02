import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";
import { MediaFilesInstance } from "./model.media.files";

export interface MediaFolderAttributes {
  folder_id: string;
  parent_id: string | null;
  name: string;
  desc: string;
  created_by: string;
}

interface MediaFolderCreationAttributes
  extends Optional<MediaFolderAttributes, "folder_id" | "parent_id" | "desc"> {}

export interface MediaFolderInstance
  extends Model<MediaFolderAttributes, MediaFolderCreationAttributes>,
    MediaFolderAttributes {
  setDataValue: (key: any, val: any) => void;
  folders: MediaFolderInstance[];
  files: MediaFilesInstance[];
}

//--> Model attributes
export const MediaFolderModelAttributes: SequelizeAttributes<MediaFolderAttributes> = {
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
    MediaFolderModelAttributes,
    {
      timestamps: true,
      tableName: "MediaFolder",
      freezeTableName: true,
      paranoid: true,
      validate: {
        paymentReferenceErr() {
          if (this.folder_id === this.parent_id) {
            throw new Error("Folder can't be parent of itself");
          }
        },
      },
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

    MediaFolder.belongsTo(models.User, {
      as: "author",
      foreignKey: "created_by",
      targetKey: "user_id",
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
