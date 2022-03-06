class MediaUtils {
  //Get all folders/files(nested)
  static allFolders(folder_id?: string, include_files = false) {
    const folderUtils = new MediaUtils();

    const where = folder_id ? `d1.folder_id = '${folder_id}'` : "d1.parent_id IS NULL ";

    const fileStr = include_files
      ? `, (
        select array_to_json(array_agg(row_to_json(file)))
        from (
          select file.*
          from "MediaFiles" file
          where d1.folder_id = file.folder_id        
        ) file
      ) AS files`
      : "";

    return `
        SELECT d1.*,
          ${folderUtils.allFoldersSubQuery(include_files)} as folders
          ${fileStr}

      FROM "MediaFolder" d1 WHERE ${where}`;
  }

  //TEMPLATE BUILD TO GET MANY
  private allFoldersSubQuery(include_files?: boolean) {
    return this.template({
      depth: 2,
      include_files,
      child: this.template({
        depth: 3,
        include_files,
        child: this.template({
          depth: 4,
          include_files,
          child: this.template({
            depth: 5,
            include_files,
            child: this.template({
              depth: 6,
              include_files,
              child: this.template({
                depth: 7,
                include_files,
                child: this.template({
                  depth: 8,
                  include_files,
                  child: this.template({
                    depth: 9,
                    include_files,
                    child: this.template({
                      depth: 10,
                      include_files,
                      child: this.template({
                        depth: 11,
                        include_files,
                        child: this.template({
                          depth: 12,
                          include_files,
                          child: this.template({
                            depth: 13,
                            include_files,
                          }),
                        }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    });
  }

  private template(prop: { child?: string; depth: number; include_files?: boolean }) {
    const { depth, child, include_files = false } = prop;

    let fileStr = "";
    if (include_files) {
      fileStr = `, (
        select array_to_json(array_agg(row_to_json(file)))
        from (
          select file.*
          from "MediaFiles" file
          where d${depth}.folder_id = file.folder_id        
        ) file
      ) AS files`;
    }

    let str = "";
    if (child) {
      str = `, ${child} as folders`;
    }
    return `
      (
        SELECT array_to_json(array_agg(row_to_json(d${depth})))
          FROM (
            SELECT d${depth}.*

            ${str}
            ${fileStr}

            FROM "MediaFolder" d${depth}
            WHERE d${depth}.parent_id = d${depth - 1}.folder_id
          ) d${depth}
        )
    `;
  }

  //get parents
  static getParentFolders = (child: string, direction: string) => {
    var orderBy = "ASC"; //hoisted var😃
    if (direction === "top_to_bottom") {
      orderBy = "ASC"; //default
    } else if (direction === "bottom_to_top") {
      orderBy = "DESC";
    }
    return `
      WITH RECURSIVE cte AS (
        SELECT "MediaFolder".* FROM "MediaFolder" WHERE "MediaFolder".folder_id = '${child}'
      UNION ALL
        SELECT n.* FROM "MediaFolder" n
          INNER JOIN cte
          ON n.folder_id = cte.parent_id
      )
      SELECT cte.name, cte.folder_id, cte.parent_id FROM cte
      -- ORDER BY cte.id ${orderBy}
    `;
  };
  //get children
  static getChildFolders = (folder_id: string, direction?: string) => {
    var orderBy = "ASC";
    if (direction === "top_to_bottom") {
      orderBy = "ASC"; //default
    } else if (direction === "bottom_to_top") {
      orderBy = "DESC";
    }
    return `
      WITH RECURSIVE cte AS (
        SELECT "MediaFolder".* FROM "MediaFolder" WHERE "MediaFolder".folder_id = '${folder_id}'
      UNION ALL
        SELECT n.* FROM "MediaFolder" n
          INNER JOIN cte
          ON n.parent_id = cte.folder_id
      )
      SELECT cte.name, cte.folder_id, cte.parent_id FROM cte
      -- ORDER BY cte."createdAt" ${orderBy}
    `;
  };
}

export default MediaUtils;
