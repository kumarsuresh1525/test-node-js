import { MenuItem } from './entities/menu-item.entity';
import { Repository } from "typeorm";
import App from "../../app";

export class MenuItemsService {

  private menuItemRepository: Repository<MenuItem>;

  constructor(app: App) {
    this.menuItemRepository = app.getDataSource().getRepository(MenuItem);
  }

  /* TODO: complete getMenuItems so that it returns a nested menu structure
    Requirements:
    - your code should result in EXACTLY one SQL query no matter the nesting level or the amount of menu items.
    - it should work for infinite level of depth (children of childrens children of childrens children, ...)
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - post process your results in javascript
    Hints:
    - open the `src/menu-items/menu-items.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /menu:
    ```json
    [
        {
            "id": 1,
            "name": "All events",
            "url": "/events",
            "parentId": null,
            "createdAt": "2021-04-27T15:35:15.000000Z",
            "children": [
                {
                    "id": 2,
                    "name": "Laracon",
                    "url": "/events/laracon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 3,
                            "name": "Illuminate your knowledge of the laravel code base",
                            "url": "/events/laracon/workshops/illuminate",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 4,
                            "name": "The new Eloquent - load more with less",
                            "url": "/events/laracon/workshops/eloquent",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                },
                {
                    "id": 5,
                    "name": "Reactcon",
                    "url": "/events/reactcon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 6,
                            "name": "#NoClass pure functional programming",
                            "url": "/events/reactcon/workshops/noclass",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 7,
                            "name": "Navigating the function jungle",
                            "url": "/events/reactcon/workshops/jungle",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
  */

    getAllChildren(map: any, parentId: number) {
        const children = map.get(parentId);
        if (!children) return;
        children.forEach((item: any) => {
            item.children = this.getAllChildren(map, item.id);
        });
        return children;
    }
  async getMenuItems() {
    const menuItems = await this.menuItemRepository.find();
    const result: any = [];
    const map = new Map();
    menuItems.forEach((item: any) => {
        if (!item.parentId) {
            result.push(item);
        } else if (!map.has(item.parentId)) {
          const menu = [item];
          map.set(item.parentId, menu);
        } else {
          const menu = map.get(item.parentId);
          menu.push(item);
          map.set(item.parentId, menu);
        }
      });
    result.map((item: any) => {
        item.children = this.getAllChildren(map, item.id);
        return item;
    });
    return result;
  }
}
