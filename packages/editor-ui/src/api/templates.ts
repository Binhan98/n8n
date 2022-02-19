import { IN8nCollectionResponse, IN8nTemplateResponse, IN8nSearchResponse } from '@/Interface';
import { post, graphql } from './helpers';

export async function getCollectionById(collectionId: string, apiEndpoint: string): Promise<IN8nCollectionResponse> {
	const query = `query getCollection($id: ID!){
		collection(id:$id){
			id
			name
			description
			image{
				id
				url
			}
			nodes{
				defaults
				name
				displayName
				icon
				iconData
				typeVersion: version
			}
			workflows(sort:"recentViews:desc,views:desc,name:asc"){
				id
				name
				nodes{
					defaults
					name
					displayName
					icon
					iconData
					typeVersion: version
					categories{
						id
						name
					}
				}
				categories{
					id
					name
				}
				user{
					username
				}
				totalViews: views
				created_at
			}
			totalViews: views
			categories{
				id
				name
			}
			created_at
		}
	}`;

	return await graphql(apiEndpoint, query, {id: collectionId});
}

export async function getTemplateById(templateId: string, apiEndpoint: string): Promise<IN8nTemplateResponse> {
	const query = `query getWorkflow($id: ID!) {
		workflow(id: $id) {
			id
			name
			description
			image{
				id
				url
			}
			workflow
			workflowInfo
			nodes{
				defaults
				name
				displayName
				icon
				iconData
				typeVersion: version
				categories{
					id
					name
				}
			}
			totalViews: views
			categories{
				id
				name
			}
			user{
				username
			}
			created_at
		}
	}`;

	return await graphql(apiEndpoint, query, {id: templateId});
}

export async function getTemplates(
	limit: number,
	skip: number,
	category: number[] | null,
	search: string,
	allData = true,
	searchQuery = false,
	apiEndpoint: string,
): Promise<IN8nSearchResponse> {
	const queryCategory = category && category.length ? `${ '[' + category + ']'}` : null;
	const query = `query {
		categories: getTemplateCategories @include(if: ${allData}) @skip(if: ${searchQuery}){
			id
			name
		}
		collections: searchCollections(
			# search parameter in string,default: null
			search: "${search}",
			# array of category id eg: [1,2] ,default: null
			category: ${queryCategory}){
			id
			name
			nodes{
				defaults
				name
				displayName
				icon
				iconData
				typeVersion: version,
				categories{
					name
				}
			}
			workflows{
				id
			}
			totalViews: views
		}
		totalworkflow: getWorkflowCount(search: "${search}", category: ${queryCategory})
		workflows: searchWorkflows(rows: ${limit},
			skip: ${skip},
			# search parameter in string,default: null
			search: "${search}",
			# array of category id eg: [1,2] ,default: null
			category: ${queryCategory}){
			id
			name
			description
			nodes{
				defaults
				name
				displayName
				icon
				iconData
				typeVersion: version,
				categories{
					name
				}
			}
			totalViews: views
			user{
				username
			}
			created_at
		}
	}`;
	return await post(apiEndpoint, `/graphql`, { query });
}
