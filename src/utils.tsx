export type TodoItemType = { taskTitle: string; taskDone: boolean; taskId: string };

export const generateDynamoDBParams = (
  listId: string
): {
  TableName: string;
  Key: {
    ListID: string;
  };
} => {
  return {
    TableName: "ubiquiti-todo",
    Key: {
      ListID: listId,
    },
  };
};

export const generateUID = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}