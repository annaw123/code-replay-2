// RPG inventory program

using System;
using System.Collections.Generic;
					
class Program
{
	static void Main()
	{
		List<string> inventory = new List<string>() {"sword", "shield"};
		while (true) {
			// DISPLAY ALL ITEMS IN INVENTORY
			int current_item_index = 0;
			while (current_item_index < inventory.Count) {
				Console.WriteLine(inventory[current_item_index]);
				current_item_index = current_item_index + 1;
			}
			choose_action(inventory);
		}
	}
	
	// Procedure to add an item to the inventory
	static void add_item(List<string> inventory)
	{
		Console.Write("What item are you adding to your inventory? : ");
		string item = Console.ReadLine();
		inventory.Add(item);
		Console.WriteLine("Item added.");
	}
	
	// Procedure to search for an item in the inventory
	static void search(List<string> inventory)
	{
		Console.Write("What item do you want to see if you have? : ");
		string item = Console.ReadLine();
		if (inventory.Contains(item)) {
			Console.WriteLine("You have the item.");
		}
		else {
			Console.WriteLine($"You do not have a {item}");
		}
	}
	
	// Procedure to remove an item from the inventory
	static void drop_item(List<string> inventory)
	{
		Console.Write("What item do you want to drop? : ");
		string item = Console.ReadLine();
		// Check item exists
		if (inventory.Contains(item)) {
			inventory.Remove(item);
			Console.WriteLine("Item dropped.");
		}
		else {
			Console.WriteLine("You do not have this item.");
		}
	}
	
	// Procedure to show an item in an inventory slot
	static void look(List<string> inventory)
	{
		Console.Write("Which inventory slot do you want to look at? :");
		int slot = Convert.ToInt32(Console.ReadLine());
		if (slot < inventory.Count) {
			Console.WriteLine($"You have a {inventory[slot]} in slot");
		}
		else {
			Console.WriteLine("Invalid slot.");
		}
	}
	
	// Procedure to craft an item
	static void craft_item(List<string> inventory)
	{
		Console.WriteLine("What item do you want to craft? : ");
		string item = Console.ReadLine();
		// Craft the item if the correct items are available
		if (item == "charm" && inventory.Contains("gem") && inventory.Contains("leather")) {
			inventory.Remove("gem");
			inventory.Remove("leather");
			inventory.Add("charm");
			Console.WriteLine($"{item} crafted.");
		}
		else {
			Console.WriteLine("You do not have the items to do this.");
		}
	}
	
	// Procedure to choose an action
	static void choose_action(List<string> inventory)
	{
		Console.WriteLine($"You have {inventory.Count} items in your inventory.");
		Console.WriteLine("What action do you want to take? (add/craft/look/drop/search) : ");
		string action = Console.ReadLine();
		switch (action) {
			case "add":
				add_item(inventory);
				break;
			case "craft":
				craft_item(inventory);
				break;
			case "drop":
				drop_item(inventory);
				break;
			case "look":
				look(inventory);
				break;
			case "search":
				search(inventory);
				break;
		}
		Console.WriteLine();
	}
}